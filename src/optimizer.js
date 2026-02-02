/**
 * Guillotine-based MaxRects 2D Bin Packing Algorithm
 * Optimized for wood cutting machines
 * 
 * This implementation uses Bottom-Left with Best Fit heuristic:
 * 1. Places pieces from top-left to bottom-right (machine-friendly)
 * 2. Uses vertical-first guillotine cuts (vertical cuts first, then horizontal)
 * 3. Consolidates waste to bottom-right corner for reuse
 * 4. Filters out small waste pieces below minimum useful size
 */

// Minimum useful waste size (smaller pieces are considered trash)
const DEFAULT_MIN_WASTE_SIZE = 100; // mm

/**
 * Represents a rectangle with position and dimensions
 */
class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Calculate the area of this rectangle
   */
  getArea() {
    return this.width * this.height;
  }

  /**
   * Check if this rectangle can contain another rectangle
   */
  canContain(width, height) {
    return this.width >= width && this.height >= height;
  }

  /**
   * Check if this rectangle overlaps with another rectangle
   */
  overlaps(other) {
    return !(
      this.x + this.width <= other.x ||
      other.x + other.width <= this.x ||
      this.y + this.height <= other.y ||
      other.y + other.height <= this.y
    );
  }
}

/**
 * Represents a piece to be placed (before placement)
 */
class Piece {
  constructor(width, height, id, rotationAllowed = false) {
    this.width = width;
    this.height = height;
    this.id = id;
    this.rotationAllowed = rotationAllowed;
  }

  /**
   * Get area of the piece
   */
  getArea() {
    return this.width * this.height;
  }

  /**
   * Get rotated dimensions (swap width and height)
   */
  getRotated() {
    return {
      width: this.height,
      height: this.width,
    };
  }
}

/**
 * Represents a placed rectangle (after placement)
 */
class PlacedRectangle {
  constructor(x, y, width, height, pieceId, pieceTypeId, rotated = false, panelIndex = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.pieceId = pieceId;
    this.pieceTypeId = pieceTypeId; // Original piece type ID
    this.rotated = rotated;
    this.panelIndex = panelIndex; // Which panel this piece is on
  }

  getArea() {
    return this.width * this.height;
  }
}

/**
 * Expand pieces with quantities into individual rectangles
 * @param {Array} pieces - Array of {id, width, height, quantity, rotationAllowed}
 * @returns {Array} Array of Piece objects with pieceTypeId
 */
export function expandPieces(pieces) {
  const expanded = [];
  let id = 0;

  for (const piece of pieces) {
    for (let i = 0; i < piece.quantity; i++) {
      const expandedPiece = new Piece(piece.width, piece.height, `piece-${id}`, piece.rotationAllowed);
      expandedPiece.pieceTypeId = piece.id; // Store original piece type ID
      expanded.push(expandedPiece);
      id++;
    }
  }

  return expanded;
}

/**
 * Sort pieces by descending area (largest first)
 * This helps place larger pieces first, reducing fragmentation
 */
function sortPiecesByArea(pieces) {
  return [...pieces].sort((a, b) => b.getArea() - a.getArea());
}

/**
 * Find the best free rectangle for placing a piece using Bottom-Left with Best Fit
 * Prioritizes top-left positions for machine-friendly cutting, then tighter fits
 * This naturally pushes waste to the bottom-right corner
 * @param {Array<Rectangle>} freeRects - List of free rectangles
 * @param {number} width - Width of piece to place
 * @param {number} height - Height of piece to place
 * @returns {Object|null} {rect: Rectangle, score: number} or null if no fit
 */
function findBestFit(freeRects, width, height) {
  let bestFit = null;
  let bestScore = Infinity;

  for (const rect of freeRects) {
    if (rect.canContain(width, height)) {
      // Bottom-Left scoring: prioritize top-left positions
      // Score = Y position * 100000 + X position * 100 + leftover area
      // Lower score is better (top-left positions get lower scores)
      const leftoverArea = rect.getArea() - width * height;
      const positionScore = (rect.y * 100000) + (rect.x * 100) + (leftoverArea / 1000);
      
      if (positionScore < bestScore) {
        bestScore = positionScore;
        bestFit = rect;
      }
    }
  }

  return bestFit ? { rect: bestFit, score: bestScore } : null;
}

/**
 * Perform guillotine split on a free rectangle after placing a piece
 * Uses VERTICAL-FIRST splitting strategy (vertical cut first, then horizontal)
 * This is more machine-friendly and consolidates waste to bottom-right
 * @param {Rectangle} freeRect - The free rectangle that was used
 * @param {number} placedX - X position of placed rectangle
 * @param {number} placedY - Y position of placed rectangle
 * @param {number} placedWidth - Width of placed rectangle
 * @param {number} placedHeight - Height of placed rectangle
 * @param {number} minWasteSize - Minimum size for useful waste (default 100mm)
 * @returns {Array<Rectangle>} Array of new free rectangles
 */
function splitRectangle(freeRect, placedX, placedY, placedWidth, placedHeight, minWasteSize = DEFAULT_MIN_WASTE_SIZE) {
  const newRects = [];

  // Calculate leftover space dimensions
  const rightWidth = freeRect.x + freeRect.width - (placedX + placedWidth);
  const bottomHeight = freeRect.y + freeRect.height - (placedY + placedHeight);

  // VERTICAL-FIRST SPLIT STRATEGY:
  // 1. First create vertical cut: right side gets full height
  // 2. Then create horizontal cut: bottom gets remaining width (up to placed piece)
  // This pushes waste to bottom-right corner
  
  // Right rectangle: full height of free rect (vertical cut first)
  // This creates a clean vertical cut line for the machine
  if (rightWidth > 0 && freeRect.height > 0) {
    // Only add if it's larger than trash threshold
    if (rightWidth >= minWasteSize || freeRect.height >= minWasteSize) {
      newRects.push(
        new Rectangle(
          placedX + placedWidth,
          freeRect.y,
          rightWidth,
          freeRect.height
        )
      );
    }
  }

  // Bottom rectangle: only the width up to the placed piece (horizontal cut second)
  // This creates a clean horizontal cut line for the machine
  if (bottomHeight > 0 && placedWidth > 0) {
    // Only add if it's larger than trash threshold
    if (placedWidth >= minWasteSize || bottomHeight >= minWasteSize) {
      newRects.push(
        new Rectangle(
          placedX,
          placedY + placedHeight,
          placedWidth,
          bottomHeight
        )
      );
    }
  }

  // Bottom-left corner: if the placed piece doesn't start at freeRect.x
  // This handles cases where there's space to the left
  const leftWidth = placedX - freeRect.x;
  if (leftWidth > 0 && bottomHeight > 0) {
    if (leftWidth >= minWasteSize || bottomHeight >= minWasteSize) {
      newRects.push(
        new Rectangle(
          freeRect.x,
          placedY + placedHeight,
          leftWidth,
          bottomHeight
        )
      );
    }
  }

  return newRects;
}

/**
 * Split free rectangles that overlap with a placed rectangle
 * Instead of removing them entirely, we split them to preserve non-overlapping portions
 * Also filters out small waste pieces below minimum useful size
 * @param {Array<Rectangle>} freeRects - List of free rectangles
 * @param {PlacedRectangle} placedRect - The placed rectangle
 * @param {number} minWasteSize - Minimum size for useful waste
 * @returns {Array<Rectangle>} List of free rectangles with overlaps removed/split
 */
function removeOverlappingFreeRects(freeRects, placedRect, minWasteSize = DEFAULT_MIN_WASTE_SIZE) {
  const placedRectObj = new Rectangle(
    placedRect.x,
    placedRect.y,
    placedRect.width,
    placedRect.height
  );
  
  const result = [];
  
  // Helper function to check if a rectangle is large enough to keep
  const isUsefulSize = (width, height) => {
    return width >= minWasteSize && height >= minWasteSize;
  };
  
  for (const freeRect of freeRects) {
    if (!freeRect.overlaps(placedRectObj)) {
      // No overlap, keep if large enough
      if (isUsefulSize(freeRect.width, freeRect.height)) {
        result.push(freeRect);
      }
      continue;
    }
    
    // Overlap detected - create non-overlapping rectangles
    // Left rectangle: portion to the left of placed piece
    if (freeRect.x < placedRect.x) {
      const leftWidth = placedRect.x - freeRect.x;
      if (isUsefulSize(leftWidth, freeRect.height)) {
        result.push(new Rectangle(
          freeRect.x,
          freeRect.y,
          leftWidth,
          freeRect.height
        ));
      }
    }
    
    // Right rectangle: portion to the right of placed piece
    const rightX = placedRect.x + placedRect.width;
    if (rightX < freeRect.x + freeRect.width) {
      const rightWidth = (freeRect.x + freeRect.width) - rightX;
      if (isUsefulSize(rightWidth, freeRect.height)) {
        result.push(new Rectangle(
          rightX,
          freeRect.y,
          rightWidth,
          freeRect.height
        ));
      }
    }
    
    // Top rectangle: portion above placed piece
    if (freeRect.y < placedRect.y) {
      const topHeight = placedRect.y - freeRect.y;
      if (isUsefulSize(freeRect.width, topHeight)) {
        result.push(new Rectangle(
          freeRect.x,
          freeRect.y,
          freeRect.width,
          topHeight
        ));
      }
    }
    
    // Bottom rectangle: portion below placed piece
    const bottomY = placedRect.y + placedRect.height;
    if (bottomY < freeRect.y + freeRect.height) {
      const bottomHeight = (freeRect.y + freeRect.height) - bottomY;
      if (isUsefulSize(freeRect.width, bottomHeight)) {
        result.push(new Rectangle(
          freeRect.x,
          bottomY,
          freeRect.width,
          bottomHeight
        ));
      }
    }
  }
  
  return result;
}

/**
 * Merge adjacent free rectangles to reduce fragmentation
 * Two rectangles can be merged if they have the same width/height
 * and are touching on one edge
 * @param {Array<Rectangle>} freeRects - List of free rectangles
 * @returns {Array<Rectangle>} Merged list of free rectangles
 */
function mergeRectangles(freeRects) {
  const merged = [];
  const used = new Set();

  for (let i = 0; i < freeRects.length; i++) {
    if (used.has(i)) continue;

    let current = freeRects[i];
    let mergedAny = true;

    // Try to merge with other rectangles
    while (mergedAny) {
      mergedAny = false;

      for (let j = i + 1; j < freeRects.length; j++) {
        if (used.has(j)) continue;

        const other = freeRects[j];

        // Check if rectangles can be merged horizontally (same height, touching vertically)
        if (
          current.height === other.height &&
          current.y === other.y &&
          (current.x + current.width === other.x || other.x + other.width === current.x)
        ) {
          const minX = Math.min(current.x, other.x);
          const maxX = Math.max(current.x + current.width, other.x + other.width);
          current = new Rectangle(minX, current.y, maxX - minX, current.height);
          used.add(j);
          mergedAny = true;
        }
        // Check if rectangles can be merged vertically (same width, touching horizontally)
        else if (
          current.width === other.width &&
          current.x === other.x &&
          (current.y + current.height === other.y || other.y + other.height === current.y)
        ) {
          const minY = Math.min(current.y, other.y);
          const maxY = Math.max(current.y + current.height, other.y + other.height);
          current = new Rectangle(current.x, minY, current.width, maxY - minY);
          used.add(j);
          mergedAny = true;
        }
      }
    }

    merged.push(current);
    used.add(i);
  }

  return merged;
}

/**
 * Filter out free rectangles that are too small to be useful
 * @param {Array<Rectangle>} freeRects - List of free rectangles
 * @param {number} minWasteSize - Minimum size for useful waste
 * @returns {Array<Rectangle>} Filtered list of free rectangles
 */
function filterSmallRectangles(freeRects, minWasteSize = DEFAULT_MIN_WASTE_SIZE) {
  return freeRects.filter(rect => 
    rect.width >= minWasteSize && rect.height >= minWasteSize
  );
}

/**
 * Optimize a single panel using Bottom-Left with Best Fit algorithm
 * @param {number} panelWidth - Width of the panel in mm
 * @param {number} panelHeight - Height of the panel in mm
 * @param {Array} piecesToPlace - Array of Piece objects to place
 * @param {number} panelIndex - Index of this panel
 * @param {number} minWasteSize - Minimum useful waste size in mm
 * @returns {Object} {placed: Array<PlacedRectangle>, remainingPieces: Array<Piece>, freeRects: Array<Rectangle>}
 */
function optimizeSinglePanel(panelWidth, panelHeight, piecesToPlace, panelIndex = 0, minWasteSize = DEFAULT_MIN_WASTE_SIZE) {
  // Initialize free rectangles list with the entire panel
  let freeRects = [new Rectangle(0, 0, panelWidth, panelHeight)];

  // Track placed pieces
  const placed = [];
  const remainingPieces = [];

  // Placement loop
  for (const piece of piecesToPlace) {
    let placedPiece = false;

    // Try original orientation first
    const fitOriginal = findBestFit(freeRects, piece.width, piece.height);

    // Try rotated orientation if allowed (rotation is now preferred/default)
    let fitRotated = null;
    if (piece.rotationAllowed) {
      const rotated = piece.getRotated();
      fitRotated = findBestFit(freeRects, rotated.width, rotated.height);
    }

    // Choose best fit (original or rotated) - lower score is better
    let bestFit = null;
    let useRotated = false;

    if (fitOriginal && fitRotated) {
      // Both fit, choose the one with better score (lower is better for bottom-left)
      if (fitRotated.score < fitOriginal.score) {
        bestFit = fitRotated;
        useRotated = true;
      } else {
        bestFit = fitOriginal;
      }
    } else if (fitOriginal) {
      bestFit = fitOriginal;
    } else if (fitRotated) {
      bestFit = fitRotated;
      useRotated = true;
    }

    // Place the piece if we found a fit
    if (bestFit) {
      const finalWidth = useRotated ? piece.height : piece.width;
      const finalHeight = useRotated ? piece.width : piece.height;

      // Place at top-left corner of the free rectangle
      const placedRect = new PlacedRectangle(
        bestFit.rect.x,
        bestFit.rect.y,
        finalWidth,
        finalHeight,
        piece.id,
        piece.pieceTypeId,
        useRotated,
        panelIndex
      );

      placed.push(placedRect);

      // Remove the used free rectangle
      const rectIndex = freeRects.indexOf(bestFit.rect);
      freeRects.splice(rectIndex, 1);

      // Split the free rectangle using vertical-first guillotine cut
      const newRects = splitRectangle(
        bestFit.rect,
        placedRect.x,
        placedRect.y,
        placedRect.width,
        placedRect.height,
        minWasteSize
      );

      // Add new free rectangles
      freeRects.push(...newRects);

      // Remove any free rectangles that overlap with the placed piece
      freeRects = removeOverlappingFreeRects(freeRects, placedRect, minWasteSize);

      // Always merge adjacent rectangles to consolidate waste
      freeRects = mergeRectangles(freeRects);
      
      // Filter out small rectangles (trash)
      freeRects = filterSmallRectangles(freeRects, minWasteSize);

      placedPiece = true;
    }

    // If piece couldn't be placed, add to remaining list
    if (!placedPiece) {
      remainingPieces.push(piece);
    }
  }

  return {
    placed,
    remainingPieces,
    freeRects,
  };
}

/**
 * Main optimization function with multiple panel support
 * Implements Guillotine-based bin packing with Bottom-Left Best Fit heuristic
 * Optimized for wood cutting machines with waste consolidation
 * Creates multiple panels as needed to fit all pieces
 * @param {number} panelWidth - Width of the panel in mm
 * @param {number} panelHeight - Height of the panel in mm
 * @param {Array} pieces - Array of {id, width, height, quantity, rotationAllowed}
 * @param {Object} options - Optional settings {minWasteSize: number}
 * @returns {Object} {panels: Array<{placed, freeRects}>, rejected: Array<Piece>, stats: Object}
 */
export function optimize(panelWidth, panelHeight, pieces, options = {}) {
  const minWasteSize = options.minWasteSize ?? DEFAULT_MIN_WASTE_SIZE;
  
  // Validate inputs
  if (panelWidth <= 0 || panelHeight <= 0) {
    return {
      panels: [],
      rejected: [],
      stats: {
        totalUsedArea: 0,
        totalWasteArea: 0,
        totalPanelArea: 0,
        usedPercentage: 0,
        wastePercentage: 100,
        panelCount: 0,
        minWasteSize,
      },
    };
  }

  // Expand pieces with quantities into individual rectangles
  const expandedPieces = expandPieces(pieces);

  // Sort pieces by descending area (largest first)
  // This helps place larger pieces first, improving overall packing
  const sortedPieces = sortPiecesByArea(expandedPieces);

  // Track all panels and remaining pieces
  const panels = [];
  let remainingPieces = [...sortedPieces];
  let panelIndex = 0;

  // Keep creating panels until all pieces are placed or no more can fit
  while (remainingPieces.length > 0) {
    const panelResult = optimizeSinglePanel(panelWidth, panelHeight, remainingPieces, panelIndex, minWasteSize);
    
    panels.push({
      placed: panelResult.placed,
      freeRects: panelResult.freeRects,
      panelIndex,
    });

    // If no pieces were placed in this panel, stop (pieces are too large)
    if (panelResult.placed.length === 0) {
      break;
    }

    // Update remaining pieces for next panel
    remainingPieces = panelResult.remainingPieces;
    panelIndex++;

    // Safety limit to prevent infinite loops
    if (panelIndex > 1000) {
      break;
    }
  }

  // Calculate statistics across all panels
  const panelArea = panelWidth * panelHeight;
  const totalPanelArea = panelArea * panels.length;
  const allPlaced = panels.flatMap(p => p.placed);
  const totalUsedArea = allPlaced.reduce((sum, rect) => sum + rect.getArea(), 0);
  const totalWasteArea = totalPanelArea - totalUsedArea;
  const usedPercentage = totalPanelArea > 0 ? (totalUsedArea / totalPanelArea) * 100 : 0;
  const wastePercentage = totalPanelArea > 0 ? (totalWasteArea / totalPanelArea) * 100 : 100;
  
  // Calculate usable waste (free rectangles that are large enough to keep)
  const usableWasteArea = panels.reduce((sum, panel) => 
    sum + panel.freeRects.reduce((rectSum, rect) => rectSum + rect.getArea(), 0), 0
  );

  return {
    panels,
    rejected: remainingPieces,
    stats: {
      totalUsedArea,
      totalWasteArea,
      totalPanelArea,
      usedPercentage,
      wastePercentage,
      panelCount: panels.length,
      minWasteSize,
      usableWasteArea,
    },
  };
}
