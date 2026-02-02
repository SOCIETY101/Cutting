/**
 * Guillotine-based MaxRects 2D Bin Packing Algorithm
 * 
 * This implementation uses the Best Area Fit heuristic with guillotine cuts.
 * The algorithm places rectangles in a panel by:
 * 1. Finding the free rectangle with the smallest leftover area after placement
 * 2. Splitting the free rectangle using guillotine cuts (horizontal or vertical)
 * 3. Managing a list of free rectangles and merging adjacent ones when possible
 */

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
 * Find the best free rectangle for placing a piece using Best Area Fit heuristic
 * Returns the free rectangle that leaves the smallest leftover area after placement
 * @param {Array<Rectangle>} freeRects - List of free rectangles
 * @param {number} width - Width of piece to place
 * @param {number} height - Height of piece to place
 * @returns {Object|null} {rect: Rectangle, waste: number} or null if no fit
 */
function findBestFit(freeRects, width, height) {
  let bestFit = null;
  let minWaste = Infinity;

  for (const rect of freeRects) {
    if (rect.canContain(width, height)) {
      // Calculate leftover area (waste) after placement
      const leftoverArea = rect.getArea() - width * height;
      
      // Best Area Fit: choose rectangle with smallest leftover area
      if (leftoverArea < minWaste) {
        minWaste = leftoverArea;
        bestFit = rect;
      }
    }
  }

  return bestFit ? { rect: bestFit, waste: minWaste } : null;
}

/**
 * Perform guillotine split on a free rectangle after placing a piece
 * Creates two new rectangles from the leftover space
 * @param {Rectangle} freeRect - The free rectangle that was used
 * @param {number} placedX - X position of placed rectangle
 * @param {number} placedY - Y position of placed rectangle
 * @param {number} placedWidth - Width of placed rectangle
 * @param {number} placedHeight - Height of placed rectangle
 * @returns {Array<Rectangle>} Array of new free rectangles (0-2 rectangles)
 */
function splitRectangle(freeRect, placedX, placedY, placedWidth, placedHeight) {
  const newRects = [];

  // Calculate leftover space dimensions
  const rightWidth = freeRect.x + freeRect.width - (placedX + placedWidth);
  const bottomHeight = freeRect.y + freeRect.height - (placedY + placedHeight);
  const leftWidth = placedX - freeRect.x;
  const topHeight = placedY - freeRect.y;

  // MaxRects algorithm: Create maximal rectangles for all leftover spaces
  // These rectangles may overlap with each other (which is fine for MaxRects),
  // but they must NOT overlap with the placed piece
  
  // Right rectangle: space to the right of placed piece
  // Starts at right edge of placed piece, extends to right edge of free rect
  // Height: from top of free rect to bottom of free rect
  if (rightWidth > 0 && freeRect.height > 0) {
    newRects.push(
      new Rectangle(
        placedX + placedWidth,
        freeRect.y,
        rightWidth,
        freeRect.height
      )
    );
  }

  // Bottom rectangle: space below placed piece
  // Starts at bottom edge of placed piece, extends to bottom of free rect
  // Width: from left edge of free rect to right edge of free rect
  if (bottomHeight > 0 && freeRect.width > 0) {
    newRects.push(
      new Rectangle(
        freeRect.x,
        placedY + placedHeight,
        freeRect.width,
        bottomHeight
      )
    );
  }

  // Left rectangle: space to the left of placed piece
  // Starts at left edge of free rect, ends at left edge of placed piece
  // Height: from top of free rect to bottom of free rect
  if (leftWidth > 0 && freeRect.height > 0) {
    newRects.push(
      new Rectangle(
        freeRect.x,
        freeRect.y,
        leftWidth,
        freeRect.height
      )
    );
  }

  // Top rectangle: space above placed piece
  // Starts at top of free rect, ends at top of placed piece
  // Width: from left edge of free rect to right edge of free rect
  if (topHeight > 0 && freeRect.width > 0) {
    newRects.push(
      new Rectangle(
        freeRect.x,
        freeRect.y,
        freeRect.width,
        topHeight
      )
    );
  }

  return newRects;
}

/**
 * Split free rectangles that overlap with a placed rectangle
 * Instead of removing them entirely, we split them to preserve non-overlapping portions
 * @param {Array<Rectangle>} freeRects - List of free rectangles
 * @param {PlacedRectangle} placedRect - The placed rectangle
 * @returns {Array<Rectangle>} List of free rectangles with overlaps removed/split
 */
function removeOverlappingFreeRects(freeRects, placedRect) {
  const placedRectObj = new Rectangle(
    placedRect.x,
    placedRect.y,
    placedRect.width,
    placedRect.height
  );
  
  const result = [];
  
  for (const freeRect of freeRects) {
    if (!freeRect.overlaps(placedRectObj)) {
      // No overlap, keep as is
      result.push(freeRect);
      continue;
    }
    
    // Overlap detected - create non-overlapping rectangles
    // Left rectangle: portion to the left of placed piece
    if (freeRect.x < placedRect.x) {
      const leftWidth = placedRect.x - freeRect.x;
      result.push(new Rectangle(
        freeRect.x,
        freeRect.y,
        leftWidth,
        freeRect.height
      ));
    }
    
    // Right rectangle: portion to the right of placed piece
    const rightX = placedRect.x + placedRect.width;
    if (rightX < freeRect.x + freeRect.width) {
      const rightWidth = (freeRect.x + freeRect.width) - rightX;
      result.push(new Rectangle(
        rightX,
        freeRect.y,
        rightWidth,
        freeRect.height
      ));
    }
    
    // Top rectangle: portion above placed piece (full width, no horizontal overlap possible)
    if (freeRect.y < placedRect.y) {
      const topHeight = placedRect.y - freeRect.y;
      result.push(new Rectangle(
        freeRect.x,
        freeRect.y,
        freeRect.width,
        topHeight
      ));
    }
    
    // Bottom rectangle: portion below placed piece (full width, no horizontal overlap possible)
    const bottomY = placedRect.y + placedRect.height;
    if (bottomY < freeRect.y + freeRect.height) {
      const bottomHeight = (freeRect.y + freeRect.height) - bottomY;
      result.push(new Rectangle(
        freeRect.x,
        bottomY,
        freeRect.width,
        bottomHeight
      ));
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
 * Optimize a single panel
 * @param {number} panelWidth - Width of the panel in mm
 * @param {number} panelHeight - Height of the panel in mm
 * @param {Array} piecesToPlace - Array of Piece objects to place
 * @param {number} panelIndex - Index of this panel
 * @returns {Object} {placed: Array<PlacedRectangle>, remainingPieces: Array<Piece>, freeRects: Array<Rectangle>}
 */
function optimizeSinglePanel(panelWidth, panelHeight, piecesToPlace, panelIndex = 0) {
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

    // Try rotated orientation if allowed
    let fitRotated = null;
    if (piece.rotationAllowed) {
      const rotated = piece.getRotated();
      fitRotated = findBestFit(freeRects, rotated.width, rotated.height);
    }

    // Choose best fit (original or rotated)
    let bestFit = null;
    let useRotated = false;

    if (fitOriginal && fitRotated) {
      // Both fit, choose the one with less waste
      if (fitRotated.waste < fitOriginal.waste) {
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

      // Split the free rectangle using guillotine cut
      const newRects = splitRectangle(
        bestFit.rect,
        placedRect.x,
        placedRect.y,
        placedRect.width,
        placedRect.height
      );

      // Add new free rectangles
      freeRects.push(...newRects);

      // Remove any free rectangles that overlap with the placed piece
      freeRects = removeOverlappingFreeRects(freeRects, placedRect);

      // Always merge adjacent rectangles to reduce fragmentation
      freeRects = mergeRectangles(freeRects);

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
 * Implements Guillotine-based MaxRects bin packing with Best Area Fit heuristic
 * Creates multiple panels as needed to fit all pieces
 * @param {number} panelWidth - Width of the panel in mm
 * @param {number} panelHeight - Height of the panel in mm
 * @param {Array} pieces - Array of {id, width, height, quantity, rotationAllowed}
 * @returns {Object} {panels: Array<{placed, freeRects}>, rejected: Array<Piece>, stats: Object}
 */
export function optimize(panelWidth, panelHeight, pieces) {
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
      },
    };
  }

  // Expand pieces with quantities into individual rectangles
  const expandedPieces = expandPieces(pieces);

  // Sort pieces by descending area (largest first)
  const sortedPieces = sortPiecesByArea(expandedPieces);

  // Track all panels and remaining pieces
  const panels = [];
  let remainingPieces = [...sortedPieces];
  let panelIndex = 0;

  // Keep creating panels until all pieces are placed or no more can fit
  while (remainingPieces.length > 0) {
    const panelResult = optimizeSinglePanel(panelWidth, panelHeight, remainingPieces, panelIndex);
    
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
    },
  };
}
