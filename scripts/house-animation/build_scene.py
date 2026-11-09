"""
Builds the Detach & Reset house animation in Blender, from the licensed
CGTrader model (art-source/house-v99, never committed or served).

  blender -b --factory-startup --python scripts/house-animation/build_scene.py -- \
      [--frames 1,30,50,90] [--out /path/to/frames] [--size 1280x720]

Story, over 96 frames (scroll-scrubbed on the page):
   1-12  the house with its panels on the old, weathered roof
  12-40  panels lift off one by one and stack beside the house
  40-62  a new roof sweeps across the old one
  62-88  the panels go back on, last stacked first
  88-96  hold on the finished house
"""

import math
import os
import sys

import bpy
import mathutils
from mathutils.bvhtree import BVHTree

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SOURCE = os.path.join(ROOT, 'art-source', 'house-v99', 'FBX Corona.FBX')
TEXTURES = os.path.join(ROOT, 'art-source', 'house-v99', 'tex')
BLEND_OUT = os.path.join(ROOT, 'art-source', 'house-v99', 'detach-reset.blend')

PANEL_W, PANEL_H, PANEL_T = 1.05, 1.76, 0.04  # metres, portrait
PANEL_GAP = 0.03
EDGE_SETBACK = 0.45  # fire-code style clearance from roof edges
LIFT = 0.12  # racking height above the tiles
FRAME_END = 96


def args():
    argv = sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else []
    opts = {'frames': None, 'out': None, 'size': '1280x720'}
    for key, value in zip(argv[::2], argv[1::2]):
        opts[key.lstrip('-')] = value
    return opts


def hex_rgb(value):
    value = value.lstrip('#')
    srgb = [int(value[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb) + (1.0,)


def principled(name, color, roughness=0.6, metallic=0.0, **extra):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = hex_rgb(color)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    for key, value in extra.items():
        bsdf.inputs[key].default_value = value
    return mat


def textured(name, image_name, roughness=0.6, scale=1.0, tint=None):
    mat = principled(name, tint or '#ffffff', roughness)
    path = os.path.join(TEXTURES, image_name)
    if not os.path.exists(path):
        return mat
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    image = nodes.new('ShaderNodeTexImage')
    image.image = bpy.data.images.load(path)
    image.projection = 'BOX'
    image.projection_blend = 0.2
    coords = nodes.new('ShaderNodeTexCoord')
    mapping = nodes.new('ShaderNodeMapping')
    mapping.inputs['Scale'].default_value = (scale, scale, scale)
    links.new(coords.outputs['Object'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], image.inputs['Vector'])
    links.new(image.outputs['Color'], nodes['Principled BSDF'].inputs['Base Color'])
    return mat


def roof_material():
    """Old weathered tiles until the animated 'Sweep' value passes, then new charcoal tiles."""
    mat = bpy.data.materials.new('roof sweep')
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    out = nodes['Material Output']
    nodes.remove(nodes['Principled BSDF'])

    old = nodes.new('ShaderNodeBsdfPrincipled')
    old.inputs['Roughness'].default_value = 0.9
    noise = nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 1.6
    noise.inputs['Detail'].default_value = 6
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = hex_rgb('#5b4f45')
    ramp.color_ramp.elements[1].color = hex_rgb('#8a7c6c')
    links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'], old.inputs['Base Color'])

    new = nodes.new('ShaderNodeBsdfPrincipled')
    new.inputs['Base Color'].default_value = hex_rgb('#262a31')
    new.inputs['Roughness'].default_value = 0.55

    coords = nodes.new('ShaderNodeTexCoord')
    split = nodes.new('ShaderNodeSeparateXYZ')
    links.new(coords.outputs['Object'], split.inputs['Vector'])
    sweep = nodes.new('ShaderNodeValue')
    sweep.name = sweep.label = 'Sweep'
    sweep.outputs[0].default_value = -12.0
    # fac = clamp((sweep - x) / 0.8): 0 = old tile, 1 = new tile, with a soft 0.8 m edge.
    diff = nodes.new('ShaderNodeMath')
    diff.operation = 'SUBTRACT'
    links.new(sweep.outputs[0], diff.inputs[0])
    links.new(split.outputs['X'], diff.inputs[1])
    fac = nodes.new('ShaderNodeMath')
    fac.operation = 'DIVIDE'
    fac.use_clamp = True
    fac.inputs[1].default_value = 0.8
    links.new(diff.outputs[0], fac.inputs[0])

    mix = nodes.new('ShaderNodeMixShader')
    links.new(fac.outputs[0], mix.inputs['Fac'])
    links.new(old.outputs[0], mix.inputs[1])
    links.new(new.outputs[0], mix.inputs[2])
    links.new(mix.outputs[0], out.inputs['Surface'])
    return mat, sweep


def panel_material():
    """Dark glass with a silver cell grid and frame."""
    mat = bpy.data.materials.new('solar panel')
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Roughness'].default_value = 0.18
    bsdf.inputs['Coat Weight'].default_value = 0.6
    coords = nodes.new('ShaderNodeTexCoord')
    bricks = nodes.new('ShaderNodeTexBrick')
    bricks.offset = 0.0
    bricks.inputs['Color1'].default_value = hex_rgb('#0f2340')
    bricks.inputs['Color2'].default_value = hex_rgb('#132a4d')
    bricks.inputs['Mortar'].default_value = hex_rgb('#9aa4b2')
    bricks.inputs['Scale'].default_value = 1.0
    bricks.inputs['Mortar Size'].default_value = 0.012
    bricks.inputs['Brick Width'].default_value = 0.165
    bricks.inputs['Row Height'].default_value = 0.165
    links.new(coords.outputs['Object'], bricks.inputs['Vector'])
    links.new(bricks.outputs['Color'], bsdf.inputs['Base Color'])
    return mat


def world_setup():
    """Soft daylight from an overcast sky. It only lights the house: the film is transparent, and
    the page draws the sky behind the frames (the site's cloud layer, by the visitor's time of day)."""
    world = bpy.data.worlds.new('daylight')
    bpy.context.scene.world = world
    world.use_nodes = True
    background = world.node_tree.nodes['Background']
    background.inputs['Color'].default_value = hex_rgb('#c9d6e8')
    background.inputs['Strength'].default_value = 0.9


def import_house():
    bpy.ops.import_scene.fbx(filepath=SOURCE)
    house = bpy.data.objects['House']
    bpy.context.view_layer.objects.active = house
    house.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    # Split the roof off, so it can take its own animated material.
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='DESELECT')
    bpy.ops.object.mode_set(mode='OBJECT')
    roof_index = next(i for i, slot in enumerate(house.material_slots) if slot.material and slot.material.name == 'roof tile')
    for polygon in house.data.polygons:
        polygon.select = polygon.material_index == roof_index
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.separate(type='SELECTED')
    bpy.ops.object.mode_set(mode='OBJECT')
    roof = next(o for o in bpy.context.selected_objects if o != house)
    roof.name = 'Roof'
    return house, roof


def restyle(house, roof, roof_mat):
    looks = {
        'white walls': principled('walls', '#efece6', 0.85),
        'concrete plates': textured('concrete', 'concrete diff.jpg', 0.85, 0.4),
        'Concrete dark': principled('concrete dark', '#5b5f63', 0.8),
        'outdoor tile': textured('pavers', 'concrete diff.jpg', 0.8, 0.6, '#d8d2c8'),
        'metal black': principled('metal black', '#1b1d20', 0.4, 0.6),
        'metal brown': principled('metal brown', '#4a3524', 0.45, 0.4),
        'paint dark': principled('paint dark', '#2a2c2f', 0.6),
        'wood plank': textured('wood', 'wood-001_alder-black-1_d.png', 0.6, 0.5),
        'metal blinds': principled('blinds', '#c9c6bf', 0.5),
        'glass': principled('glass', '#1b2633', 0.05, 0.0, **{'Coat Weight': 1.0}),
        'Glass Milky': principled('glass milky', '#d9dde2', 0.3),
        'interior tile': principled('interior tile', '#cfc8bd', 0.4),
        'metal': principled('metal', '#9aa0a6', 0.3, 0.9),
        'light': principled('light', '#fff3d6', 0.4, 0.0, **{'Emission Color': hex_rgb('#ffd9a0'), 'Emission Strength': 2.0}),
    }
    for slot in house.material_slots:
        if slot.material and slot.material.name in looks:
            slot.material = looks[slot.material.name]
    for slot in roof.material_slots:
        slot.material = roof_mat


def roof_segments(roof):
    """Coplanar roof patches, from faces grouped by facing and by height of plane."""
    groups = {}
    for polygon in roof.data.polygons:
        normal = polygon.normal.normalized()
        if not 0.3 < normal.z < 0.97:
            continue
        azimuth = round(math.degrees(math.atan2(normal.x, normal.y)) / 15) * 15 % 360
        if azimuth % 90:
            continue  # hip corners and trims: too small for panels
        offset = round(normal.dot(polygon.center) / 0.25)
        groups.setdefault((azimuth, offset), []).append(polygon)
    segments = []
    for (azimuth, _), polygons in groups.items():
        normal = sum((p.normal for p in polygons), mathutils.Vector()).normalized()
        area = sum(p.area for p in polygons)
        offset = sum(normal.dot(p.center) * p.area for p in polygons) / area
        segments.append({'azimuth': azimuth, 'normal': normal, 'offset': offset, 'area': area, 'faces': polygons})
    return sorted(segments, key=lambda segment: -segment['area'])


def roof_heights(roof, step=0.2):
    """
    Where the roof is, seen from straight above: (x, y) -> (z, facing). Rays go
    straight down, so the result follows the real roof slope rather than the
    tilt of each overlapping tile.
    """
    bvh = BVHTree.FromObject(roof, bpy.context.evaluated_depsgraph_get())
    box = [roof.matrix_world @ mathutils.Vector(corner) for corner in roof.bound_box]
    x0, x1 = min(p.x for p in box), max(p.x for p in box)
    y0, y1 = min(p.y for p in box), max(p.y for p in box)
    grid = {}
    for ix in range(int((x1 - x0) / step) + 1):
        for iy in range(int((y1 - y0) / step) + 1):
            x, y = x0 + ix * step, y0 + iy * step
            hit = bvh.ray_cast(mathutils.Vector((x, y, 50)), mathutils.Vector((0, 0, -1)), 100)
            if hit[0] is None:
                continue
            normal = hit[1]
            if math.hypot(normal.x, normal.y) < 0.15:
                continue
            facing = round(math.degrees(math.atan2(normal.x, normal.y)) / 90) * 90 % 360
            grid[(ix, iy)] = (hit[0].z, facing)
    return grid, x0, y0, step


def place_panels(roof, segments, azimuths, limit):
    """
    Rows of portrait panels on the roof slopes facing `azimuths`. A spot is used
    only when every sample under the panel (plus EDGE_SETBACK) is roof facing
    that way, and the heights fit one flat plane: no hanging over an edge, a
    hip or a ridge.
    """
    grid, x0, y0, step = roof_heights(roof)
    spots = []
    for azimuth in sorted(azimuths):
        cells = [(k, z) for k, (z, facing) in grid.items() if facing == azimuth]
        if not cells:
            continue
        # Downhill direction in plan, and the roof's rise per metre along it, from a least-squares fit.
        down = mathutils.Vector((math.sin(math.radians(azimuth)), math.cos(math.radians(azimuth)), 0))
        along = mathutils.Vector((-down.y, down.x, 0))
        ds = [(x0 + k[0] * step) * down.x + (y0 + k[1] * step) * down.y for k, _ in cells]
        # Rise per metre downhill, from each cell and its downhill neighbour (median, so the
        # L-shaped house's separate roof sections at different heights don't flatten it).
        shift = (round(down.x), round(down.y))
        rises = sorted(
            (grid[(k[0] + shift[0], k[1] + shift[1])][0] - z) / step
            for k, z in cells
            if grid.get((k[0] + shift[0], k[1] + shift[1]), (0, None))[1] == azimuth
        )
        slope = rises[len(rises) // 2]
        pitch = math.atan(-slope)
        normal = (down * math.sin(pitch) + mathutils.Vector((0, 0, math.cos(pitch)))).normalized()
        up_slope = (mathutils.Vector((0, 0, math.sin(pitch))) - down * math.cos(pitch)).normalized()
        u_axis = along
        if u_axis.cross(up_slope).dot(normal) < 0:
            u_axis = -u_axis
        print(f'[house] azimuth {azimuth}: pitch {math.degrees(pitch):.0f} deg')

        def height(x, y):
            cell = grid.get((round((x - x0) / step), round((y - y0) / step)))
            return cell[0] if cell and cell[1] == azimuth else None

        plan_w = PANEL_W / 2 + EDGE_SETBACK
        plan_h = (PANEL_H / 2 + EDGE_SETBACK) * math.cos(pitch)
        a_vals = [(x0 + k[0] * step) * along.x + (y0 + k[1] * step) * along.y for k, _ in cells]
        placed = 0
        row_d = max(ds) - plan_h
        while row_d > min(ds) + plan_h and len(spots) < limit:
            a = min(a_vals) + plan_w
            while a < max(a_vals) - plan_w and len(spots) < limit:
                cx, cy = (down * row_d + along * a)[:2]
                samples = []
                for fu in (-1, -0.5, 0, 0.5, 1):
                    for fv in (-1, -0.5, 0, 0.5, 1):
                        px, py = (mathutils.Vector((cx, cy, 0)) + along * fu * plan_w + down * fv * plan_h)[:2]
                        samples.append((px, py, height(px, py)))
                if all(z is not None for _, _, z in samples):
                    center_z = height(cx, cy)
                    predicted = [center_z + slope * ((px - cx) * down.x + (py - cy) * down.y) for px, py, _ in samples]
                    if max(abs(z - p) for (_, _, z), p in zip(samples, predicted)) < 0.15:
                        center = mathutils.Vector((cx, cy, center_z)) + normal * LIFT
                        rotation = mathutils.Matrix((u_axis, up_slope, normal)).transposed().to_quaternion()
                        spots.append((center, rotation))
                        placed += 1
                        a += PANEL_W + PANEL_GAP
                        continue
                a += 0.1
            row_d -= (PANEL_H + PANEL_GAP) * math.cos(pitch)
        print(f'[house] azimuth {azimuth}: {placed} panels')
    return spots


def make_panel(index, mat):
    bpy.ops.mesh.primitive_cube_add(size=1)
    panel = bpy.context.active_object
    panel.name = f'Panel {index:02d}'
    panel.scale = (PANEL_W, PANEL_H, PANEL_T)
    bpy.ops.object.transform_apply(scale=True)
    bevel = panel.modifiers.new('frame', 'BEVEL')
    bevel.width, bevel.segments = 0.012, 2
    panel.data.materials.append(mat)
    panel.rotation_mode = 'QUATERNION'
    return panel


def ease(obj):
    if obj.animation_data and obj.animation_data.action:
        for fcurve in getattr(obj.animation_data.action, 'fcurves', []):
            for key in fcurve.keyframe_points:
                key.interpolation = 'BEZIER'
                key.easing = 'EASE_IN_OUT'


def key(obj, frame, location, rotation):
    obj.location = location
    obj.rotation_quaternion = rotation
    obj.keyframe_insert('location', frame=frame)
    obj.keyframe_insert('rotation_quaternion', frame=frame)


def animate_panels(spots, mat, stack_at):
    flat = mathutils.Quaternion((1, 0, 0, 0))
    count = len(spots)
    for index, (roof_pos, roof_rot) in enumerate(spots):
        panel = make_panel(index, mat)
        lifted = roof_pos + roof_rot @ mathutils.Vector((0, 0, 0.6))
        stack = stack_at + mathutils.Vector((0, 0, 0.05 + index * (PANEL_T + 0.015)))
        above = stack + mathutils.Vector((0, 0, 2.2))
        # Off, in order: 12 -> 40. Back on, last stacked first: 62 -> 88.
        off = 12 + index * (18 / max(count - 1, 1))
        on = 62 + (count - 1 - index) * (18 / max(count - 1, 1))
        key(panel, 1, roof_pos, roof_rot)
        key(panel, off, roof_pos, roof_rot)
        key(panel, off + 2, lifted, roof_rot)
        key(panel, off + 6, above, flat)
        key(panel, off + 8, stack, flat)
        key(panel, on, stack, flat)
        key(panel, on + 2, above, flat)
        key(panel, on + 6, lifted, roof_rot)
        key(panel, on + 8, roof_pos, roof_rot)
        ease(panel)


def flat_deck(house, min_x, min_y):
    """The front-most flat roof (the porch deck): downward raycasts, keeping level hits 2-5 m up."""
    depsgraph = bpy.context.evaluated_depsgraph_get()
    box = [house.matrix_world @ mathutils.Vector(corner) for corner in house.bound_box]
    max_x = max(p.x for p in box)
    max_y = max(p.y for p in box)
    hits = []
    for i in range(60):
        for j in range(60):
            x = min_x + (max_x - min_x) * (i + 0.5) / 60
            y = min_y + (max_y - min_y) * (j + 0.5) / 60
            ok, where, normal, _, obj, _ = bpy.context.scene.ray_cast(depsgraph, (x, y, 50), (0, 0, -1))
            if ok and obj == house and normal.z > 0.98 and 2.0 < where.z < 5.0:
                hits.append(where.copy())
    if not hits:
        return mathutils.Vector((min_x + 6.5, min_y - 0.2, 0.0))
    front = min(p.y for p in hits)
    near_front = [p for p in hits if p.y < front + 2.0]
    # The middle of the front strip, stepped back from the edge so the pallet sits fully on the deck.
    middle = sum((p for p in near_front), mathutils.Vector()) / len(near_front)
    return mathutils.Vector((middle.x, front + 1.4, max(p.z for p in near_front)))


def pallet(at):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(at.x, at.y, at.z - 0.07))
    base = bpy.context.active_object
    base.name = 'Pallet'
    base.scale = (PANEL_W + 0.2, PANEL_H + 0.2, 0.14)
    base.data.materials.append(principled('pallet wood', '#9a7a52', 0.85))


def ground():
    """A shadow catcher: invisible, except for the house's shadow on it."""
    bpy.ops.mesh.primitive_plane_add(size=240, location=(0, 0, -0.02))
    plane = bpy.context.active_object
    plane.name = 'Ground'
    plane.is_shadow_catcher = True
    plane.data.materials.append(principled('ground', '#808080', 0.9))


def lights_and_camera(target):
    bpy.ops.object.light_add(type='SUN', rotation=(math.radians(62), 0, math.radians(-38)))
    sun = bpy.context.active_object
    # Soft daylight: a sun through thin cloud.
    sun.data.energy = 3.0
    sun.data.color = (1.0, 0.96, 0.9)
    sun.data.angle = math.radians(6)

    bpy.ops.object.empty_add(location=target)
    aim = bpy.context.active_object
    aim.name = 'Aim'
    bpy.ops.object.camera_add()
    camera = bpy.context.active_object
    camera.data.lens = 52
    track = camera.constraints.new('TRACK_TO')
    track.target = aim
    bpy.context.scene.camera = camera
    # A slow quarter-orbit across the whole story, from the front-left corner.
    radius, height = 34.0, 8.0
    for frame, angle in ((1, -128), (FRAME_END, -104)):
        a = math.radians(angle)
        camera.location = (target.x + radius * math.cos(a), target.y + radius * math.sin(a), height)
        camera.keyframe_insert('location', frame=frame)


def main():
    opts = args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, FRAME_END
    scene.render.fps = 24

    house, roof = import_house()
    roof_mat, sweep = roof_material()
    restyle(house, roof, roof_mat)
    segments = roof_segments(roof)
    # The camera looks from the south-west: fill the south (180) and west (270) slopes.
    spots = place_panels(roof, segments, azimuths={180, 270}, limit=24)
    print(f'[house] {len(spots)} panels placed')

    box = [house.matrix_world @ mathutils.Vector(corner) for corner in house.bound_box]
    min_x = min(p.x for p in box)
    min_y = min(p.y for p in box)
    # The stack sits on a pallet on the flat porch roof, in clear view of the camera ("stored safely").
    deck = flat_deck(house, min_x, min_y)
    stack_at = mathutils.Vector((deck.x, deck.y, deck.z + 0.14))
    pallet(stack_at)
    animate_panels(spots, panel_material(), stack_at=stack_at)

    # New roof sweeps across 40 -> 62.
    sweep.outputs[0].default_value = -12.0
    sweep.outputs[0].keyframe_insert('default_value', frame=40)
    sweep.outputs[0].default_value = 12.0
    sweep.outputs[0].keyframe_insert('default_value', frame=62)

    ground()
    world_setup()
    # Aim above the ridge so the house sits low and the sky fills the top, under the heading.
    lights_and_camera(mathutils.Vector((0.0, -1.0, 5.4)))

    render = scene.render
    # Cycles, because only Cycles has a shadow catcher; the film is transparent so the page's sky shows.
    render.engine = 'CYCLES'
    cycles_prefs = bpy.context.preferences.addons['cycles'].preferences
    cycles_prefs.compute_device_type = 'METAL'
    cycles_prefs.get_devices()
    for device in cycles_prefs.devices:
        device.use = True
    scene.cycles.device = 'GPU'
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    render.film_transparent = True
    width, height = (int(v) for v in opts['size'].split('x'))
    render.resolution_x, render.resolution_y = width, height
    render.image_settings.file_format = 'WEBP'
    render.image_settings.color_mode = 'RGBA'
    render.image_settings.quality = 82
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast' if 'AgX - Medium High Contrast' in [
        i.identifier for i in scene.view_settings.bl_rna.properties['look'].enum_items
    ] else 'None'

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    print(f'[house] saved {BLEND_OUT}')

    if opts['out']:
        os.makedirs(opts['out'], exist_ok=True)
        frames = [int(f) for f in opts['frames'].split(',')] if opts['frames'] else range(1, FRAME_END + 1)
        for frame in frames:
            scene.frame_set(frame)
            render.filepath = os.path.join(opts['out'], f'frame-{frame:03d}.webp')
            bpy.ops.render.render(write_still=True)
            print(f'[house] rendered {render.filepath}')


main()
