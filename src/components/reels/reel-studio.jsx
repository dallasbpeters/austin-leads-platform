'use client'

/*
 * The reel studio: build a vertical reel on a phone.
 *
 * Shape of the screen, from the top: the preview (always visible), the scene
 * strip, then the editor for whichever scene is open. One thing to look at,
 * one thing to edit. Everything is a big tap target — this gets used standing
 * in someone's driveway.
 */

import { useCallback, useMemo, useState } from 'react'

import { Check, Clock, Copy, Film, ImageIcon, Plus, Trash2, X } from 'lucide-react'

import ReelPreview from '@/components/reels/reel-preview'
import RenderBar from '@/components/reels/render-bar'
import {
  BULB_COLORS,
  makeScene,
  SCENE_MAX_SECONDS,
  SCENE_MIN_SECONDS,
  SCENE_TYPES,
  sceneSeconds,
  sceneSummary,
  sceneTypeOf,
  STARTER_SCENES,
  toRenderScenes,
  totalSeconds,
} from '@/lib/reels/scenes'

// ─── Small pieces ────────────────────────────────────────────────────────────

function SheetShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70" role="dialog">
      <button aria-label="Close" className="flex-1" onClick={onClose} type="button" />
      <div className="max-h-[86dvh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#0d1524] pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#0d1524] px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full bg-white/10 active:scale-95"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ field, value, onChange }) {
  const id = `field-${field.id}`
  const shared =
    'w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 focus:border-[#f0c987] focus:outline-none'
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm text-white/60">{field.label}</span>
      {field.lines > 1 ? (
        <textarea
          className={shared}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          rows={field.lines}
          value={value || ''}
        />
      ) : (
        <input
          className={shared}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          value={value || ''}
        />
      )}
    </label>
  )
}

function PhotoPicker({ photos, selectedId, onPick, onClose }) {
  const [query, setQuery] = useState('')
  const matches = query.trim()
    ? photos.filter((photo) => photo.name.toLowerCase().includes(query.trim().toLowerCase()))
    : photos

  return (
    <SheetShell onClose={onClose} title="Pick a photo">
      <input
        className="mb-4 w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 focus:border-[#f0c987] focus:outline-none"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by file name"
        value={query}
      />
      {matches.length ? null : <p className="text-sm text-white/50">Nothing matches that.</p>}
      <div className="grid grid-cols-3 gap-2">
        {matches.map((photo) => (
          <button
            className={`relative aspect-[3/4] overflow-hidden rounded-xl border ${
              photo.id === selectedId ? 'border-[#f0c987]' : 'border-white/10'
            }`}
            key={photo.id}
            onClick={() => onPick(photo)}
            type="button"
          >
            {/* oxlint-disable-next-line next/no-img-element -- Sanity CDN thumbnail, already sized */}
            <img alt={photo.name} className="size-full object-cover" loading="lazy" src={photo.thumb} />
            {photo.id === selectedId ? (
              <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-[#f0c987] text-black">
                <Check className="size-4" />
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </SheetShell>
  )
}

function SceneEditor({ scene, photos, onChange, onRemove, onClose }) {
  const [pickingPhoto, setPickingPhoto] = useState(false)
  const definition = sceneTypeOf(scene)
  const set = (key, value) => onChange({ ...scene, [key]: value })

  return (
    <SheetShell onClose={onClose} title={definition.label}>
      <p className="mb-5 text-sm text-white/55">{definition.hint}</p>

      <div className="grid gap-4">
        {definition.needsPhoto ? (
          <button
            className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/5 p-3 text-left active:scale-[0.99]"
            onClick={() => setPickingPhoto(true)}
            type="button"
          >
            {scene.photo ? (
              // oxlint-disable-next-line next/no-img-element -- Sanity CDN thumbnail, already sized
              <img alt="" className="size-16 rounded-lg object-cover" src={scene.photo.thumb} />
            ) : (
              <span className="grid size-16 place-items-center rounded-lg bg-white/10">
                <ImageIcon className="size-6 text-white/60" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-base">{scene.photo ? 'Change photo' : 'Pick a photo'}</span>
              <span className="block truncate text-sm text-white/50">
                {scene.photo?.name || 'From your Sanity library'}
              </span>
            </span>
          </button>
        ) : null}

        {definition.fields.map((field) => (
          <Field
            field={field}
            key={field.id}
            onChange={(value) => set(field.id, value)}
            value={scene[field.id]}
          />
        ))}

        {scene.type === 'lights' ? (
          <fieldset>
            <legend className="mb-2 block text-sm text-white/60">Bulb color</legend>
            <div className="grid grid-cols-3 gap-2">
              {BULB_COLORS.map((color) => (
                <button
                  className={`rounded-xl border px-3 py-3 text-sm ${
                    (scene.bulbColor || 'warm-white') === color.value
                      ? 'border-[#f0c987] bg-[#f0c987]/15 text-[#f0c987]'
                      : 'border-white/12 bg-white/5 text-white/70'
                  }`}
                  key={color.value}
                  onClick={() => set('bulbColor', color.value)}
                  type="button"
                >
                  {color.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <label className="block" htmlFor="scene-seconds">
          <span className="mb-2 flex items-center justify-between text-sm text-white/60">
            <span>How long</span>
            <span className="font-mono text-white/80 tabular-nums">{sceneSeconds(scene).toFixed(1)}s</span>
          </span>
          <input
            className="h-11 w-full accent-[#f0c987]"
            id="scene-seconds"
            max={SCENE_MAX_SECONDS}
            min={SCENE_MIN_SECONDS}
            onChange={(event) => set('duration', Number(event.target.value))}
            step={0.5}
            type="range"
            value={sceneSeconds(scene)}
          />
        </label>

        <button
          className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 py-3 text-red-200 active:scale-[0.99]"
          onClick={onRemove}
          type="button"
        >
          <Trash2 className="size-4" />
          Remove this scene
        </button>
      </div>

      {pickingPhoto ? (
        <PhotoPicker
          onClose={() => setPickingPhoto(false)}
          onPick={(photo) => {
            onChange({ ...scene, photo })
            setPickingPhoto(false)
          }}
          photos={photos}
          selectedId={scene.photo?.id}
        />
      ) : null}
    </SheetShell>
  )
}

function AddScene({ onAdd, onClose }) {
  return (
    <SheetShell onClose={onClose} title="Add a scene">
      <div className="grid gap-2">
        {SCENE_TYPES.map((definition) => (
          <button
            className="rounded-xl border border-white/12 bg-white/5 p-4 text-left active:scale-[0.99]"
            key={definition.type}
            onClick={() => onAdd(definition.type)}
            type="button"
          >
            <span className="block text-base font-medium">{definition.label}</span>
            <span className="mt-1 block text-sm text-white/55">{definition.hint}</span>
          </button>
        ))}
      </div>
    </SheetShell>
  )
}

// ─── The studio ──────────────────────────────────────────────────────────────

export default function ReelStudio({ photos = [] }) {
  const [scenes, setScenes] = useState(STARTER_SCENES)
  const [openSceneId, setOpenSceneId] = useState(null)
  const [adding, setAdding] = useState(false)

  const renderScenes = useMemo(() => toRenderScenes(scenes), [scenes])
  const seconds = totalSeconds(scenes)
  const openScene = scenes.find((scene) => scene.id === openSceneId) || null

  const updateScene = useCallback(
    (next) => setScenes((current) => current.map((scene) => (scene.id === next.id ? next : scene))),
    [],
  )

  const addScene = (type) => {
    const scene = makeScene(type)
    setScenes((current) => [...current, scene])
    setAdding(false)
    setOpenSceneId(scene.id)
  }

  const duplicateScene = (id) =>
    setScenes((current) => {
      const index = current.findIndex((scene) => scene.id === id)
      const copy = { ...current[index], id: makeScene(current[index].type).id }
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)]
    })

  const removeScene = (id) => {
    setScenes((current) => (current.length > 1 ? current.filter((scene) => scene.id !== id) : current))
    setOpenSceneId(null)
  }

  const move = (id, direction) =>
    setScenes((current) => {
      const index = current.findIndex((scene) => scene.id === id)
      const target = index + direction
      if (target < 0 || target >= current.length) {
        return current
      }
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-5 px-4 pt-[max(20px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="size-5 text-[#f0c987]" />
          <h1 className="text-lg font-semibold">Reel studio</h1>
        </div>
        <span className="flex items-center gap-1.5 text-sm text-white/55">
          <Clock className="size-4" />
          <span className="font-mono tabular-nums">{seconds.toFixed(0)}s</span>
        </span>
      </header>

      <ReelPreview scenes={renderScenes} />

      <section className="grid gap-2">
        <h2 className="text-sm text-white/55">Scenes</h2>
        {scenes.map((scene, index) => (
          <div
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2"
            key={scene.id}
          >
            <button
              className="flex min-w-0 flex-1 items-center gap-3 p-1 text-left"
              onClick={() => setOpenSceneId(scene.id)}
              type="button"
            >
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/10 text-sm text-white/70">
                {scene.photo ? (
                  // oxlint-disable-next-line next/no-img-element -- Sanity CDN thumbnail, already sized
                  <img alt="" className="size-full object-cover" src={scene.photo.thumb} />
                ) : (
                  index + 1
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base">{sceneSummary(scene)}</span>
                <span className="block text-xs text-white/45">
                  {sceneTypeOf(scene).label} · {sceneSeconds(scene).toFixed(1)}s
                </span>
              </span>
            </button>
            <div className="flex shrink-0 items-center">
              <button
                aria-label="Move up"
                className="grid size-9 place-items-center rounded-lg text-white/50 active:scale-95 disabled:opacity-25"
                disabled={index === 0}
                onClick={() => move(scene.id, -1)}
                type="button"
              >
                ↑
              </button>
              <button
                aria-label="Move down"
                className="grid size-9 place-items-center rounded-lg text-white/50 active:scale-95 disabled:opacity-25"
                disabled={index === scenes.length - 1}
                onClick={() => move(scene.id, 1)}
                type="button"
              >
                ↓
              </button>
              <button
                aria-label="Duplicate"
                className="grid size-9 place-items-center rounded-lg text-white/50 active:scale-95"
                onClick={() => duplicateScene(scene.id)}
                type="button"
              >
                <Copy className="size-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-4 text-white/70 active:scale-[0.99]"
          onClick={() => setAdding(true)}
          type="button"
        >
          <Plus className="size-5" />
          Add a scene
        </button>
      </section>

      <RenderBar scenes={renderScenes} seconds={seconds} />

      {openScene ? (
        <SceneEditor
          onChange={updateScene}
          onClose={() => setOpenSceneId(null)}
          onRemove={() => removeScene(openScene.id)}
          photos={photos}
          scene={openScene}
        />
      ) : null}

      {adding ? <AddScene onAdd={addScene} onClose={() => setAdding(false)} /> : null}
    </div>
  )
}
