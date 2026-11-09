/*
 * Lines the sharp Maps photo up with the Solar API photo the panels were
 * measured on. The two photos are taken on different days from different
 * angles, so the same roof sits a few metres apart in them. Both are sampled
 * around the roof centre in metres, turned into edge maps (roof lines and
 * shadows match better than raw colour across days), and the shift with the
 * best normalised correlation wins.
 */

/** Grey value of a single-channel image at fractional pixel (px, py), clamped to the edge. */
export function pixelAt(data, width, height, px, py) {
  const x = Math.min(width - 1, Math.max(0, Math.round(px)))
  const y = Math.min(height - 1, Math.max(0, Math.round(py)))
  return data[y * width + x]
}

/** RGB bytes to one grey channel. */
export function toGray(rgb, channels = 3) {
  const gray = new Uint8Array(rgb.length / channels)
  for (let i = 0; i < gray.length; i += 1) {
    const o = i * channels
    gray[i] = Math.round(0.299 * rgb[o] + 0.587 * rgb[o + 1] + 0.114 * rgb[o + 2])
  }
  return gray
}

const sampleGrid = (at, start, count, step) => {
  const grid = new Float32Array(count * count)
  for (let j = 0; j < count; j += 1) {
    for (let i = 0; i < count; i += 1) {
      grid[j * count + i] = at(start + i * step, start + j * step)
    }
  }
  return grid
}

const edges = (grid, count) => {
  const out = new Float32Array(count * count)
  for (let j = 1; j < count - 1; j += 1) {
    for (let i = 1; i < count - 1; i += 1) {
      const k = j * count + i
      out[k] = Math.abs(grid[k + 1] - grid[k - 1]) + Math.abs(grid[k + count] - grid[k - count])
    }
  }
  return out
}

/**
 * The shift d, in metres, such that what sits at x in the reference photo sits
 * at x + d in the other one. `referenceAt(x, y)` and `otherAt(x, y)` return grey
 * values at metres from the roof centre (x east, y south). `score` is the
 * normalised correlation of the best shift, from -1 to 1.
 */
export function findOffset(referenceAt, otherAt, { half = 12, search = 5, step = 0.2 } = {}) {
  const count = Math.round((2 * half) / step) + 1
  const reach = Math.round(search / step)
  const wide = count + 2 * reach

  const reference = edges(sampleGrid(referenceAt, -half, count, step), count)
  const other = edges(sampleGrid(otherAt, -half - reach * step, wide, step), wide)

  let refMean = 0
  for (const value of reference) {
    refMean += value
  }
  refMean /= reference.length
  let refNorm = 0
  for (const value of reference) {
    refNorm += (value - refMean) ** 2
  }

  let best = { dx: 0, dy: 0, score: -1 }
  for (let sy = 0; sy <= 2 * reach; sy += 1) {
    for (let sx = 0; sx <= 2 * reach; sx += 1) {
      let sum = 0
      for (let j = 0; j < count; j += 1) {
        const row = (j + sy) * wide + sx
        for (let i = 0; i < count; i += 1) {
          sum += other[row + i]
        }
      }
      const mean = sum / reference.length
      let cross = 0
      let norm = 0
      for (let j = 0; j < count; j += 1) {
        const row = (j + sy) * wide + sx
        for (let i = 0; i < count; i += 1) {
          const value = other[row + i] - mean
          cross += value * (reference[j * count + i] - refMean)
          norm += value * value
        }
      }
      const score = refNorm && norm ? cross / Math.sqrt(refNorm * norm) : 0
      if (score > best.score) {
        best = { dx: (sx - reach) * step, dy: (sy - reach) * step, score }
      }
    }
  }
  return best
}
