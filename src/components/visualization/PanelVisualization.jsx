import React, { useState, useRef, useEffect } from 'react'
import { VisualizationToolbar } from './VisualizationToolbar'

// Helper for piece colors
const getPieceTypeColor = (id) => {
  const hue = (id * 137.508) % 360
  return `hsl(${hue}, 70%, 80%)`
}

export function PanelVisualization({
  panel,
  width,
  height,
  index,
  poignetEnabled,
  minWasteSize = 100
}) {
  // View State
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Layer Toggles
  const [showDimensions, setShowDimensions] = useState(true)
  const [showIDs, setShowIDs] = useState(true)
  const [showWaste, setShowWaste] = useState(false)
  const [showPoignet, setShowPoignet] = useState(true)
  
  // Hover State
  const [hoveredPiece, setHoveredPiece] = useState(null)
  
  const containerRef = useRef(null)
  const svgRef = useRef(null)

  // Ruler config - increased padding for staggered dimensions
  const RULER_PADDING = 180
  const totalWidth = width + RULER_PADDING * 2
  const totalHeight = height + RULER_PADDING * 2

  // Tolerance for edge detection (mm)
  const EDGE_TOLERANCE = 2

  // Categorize pieces by which edges they touch
  const categorizePieces = () => {
    const topPieces = []
    const bottomPieces = []
    const leftPieces = []
    const rightPieces = []
    
    panel.placed.forEach((rect) => {
      const touchesTop = rect.y < EDGE_TOLERANCE
      const touchesBottom = Math.abs((rect.y + rect.height) - height) < EDGE_TOLERANCE
      const touchesLeft = rect.x < EDGE_TOLERANCE
      const touchesRight = Math.abs((rect.x + rect.width) - width) < EDGE_TOLERANCE
      
      // For horizontal dimensions (width)
      if (touchesTop) {
        topPieces.push({ ...rect, needsGuide: false })
      } else {
        // Show on top with guide
        topPieces.push({ ...rect, needsGuide: true })
      }
      
      if (touchesBottom) {
        bottomPieces.push({ ...rect, needsGuide: false })
      }
      
      // For vertical dimensions (height)
      if (touchesLeft) {
        leftPieces.push({ ...rect, needsGuide: false })
      } else {
        // Show on left with guide
        leftPieces.push({ ...rect, needsGuide: true })
      }
      
      if (touchesRight) {
        rightPieces.push({ ...rect, needsGuide: false })
      }
    })
    
    // Sort by position for staggering
    topPieces.sort((a, b) => a.x - b.x)
    bottomPieces.sort((a, b) => a.x - b.x)
    leftPieces.sort((a, b) => a.y - b.y)
    rightPieces.sort((a, b) => a.y - b.y)
    
    return { topPieces, bottomPieces, leftPieces, rightPieces }
  }

  // Assign stagger levels to avoid overlapping dimensions
  const assignStaggerLevels = (pieces, isHorizontal) => {
    const levels = []
    
    pieces.forEach((piece) => {
      const start = isHorizontal ? piece.x : piece.y
      const end = isHorizontal ? piece.x + piece.width : piece.y + piece.height
      
      // Find the first level where this piece doesn't overlap
      let level = 0
      while (true) {
        if (!levels[level]) {
          levels[level] = []
        }
        
        const hasOverlap = levels[level].some(existing => {
          const existingStart = isHorizontal ? existing.x : existing.y
          const existingEnd = isHorizontal ? existing.x + existing.width : existing.y + existing.height
          // Check if ranges overlap (with generous padding to prevent text collision)
          const padding = 80
          return !(end + padding < existingStart || start - padding > existingEnd)
        })
        
        if (!hasOverlap) {
          levels[level].push(piece)
          piece.staggerLevel = level
          break
        }
        level++
      }
    })
    
    return pieces
  }

  // Calculate optimal fit
  const fitPanel = () => {
    if (containerRef.current && width && height) {
      const { clientWidth, clientHeight } = containerRef.current
      const padding = 20
      
      const scaleX = (clientWidth - padding) / totalWidth
      const scaleY = (clientHeight - padding) / totalHeight
      const newScale = Math.min(scaleX, scaleY)
      
      const scaledWidth = totalWidth * newScale
      const scaledHeight = totalHeight * newScale
      const x = (clientWidth - scaledWidth) / 2
      const y = (clientHeight - scaledHeight) / 2
      
      setScale(newScale)
      setPosition({ x, y })
    }
  }

  useEffect(() => {
    fitPanel()
    
    const observer = new ResizeObserver(() => {
      fitPanel()
    })
    
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    
    return () => observer.disconnect()
  }, [width, height])

  // Zoom handlers
  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5))
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.05))
  const handleReset = fitPanel

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setScale(prev => Math.min(Math.max(prev * delta, 0.05), 5))
    }
  }

  const handleExport = () => {
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `panel-${index + 1}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get processed pieces with stagger levels
  const { topPieces, bottomPieces, leftPieces, rightPieces } = categorizePieces()
  assignStaggerLevels(topPieces, true)
  assignStaggerLevels(bottomPieces, true)
  assignStaggerLevels(leftPieces, false)
  assignStaggerLevels(rightPieces, false)

  // Base offset and spacing for staggered levels - increased for better readability
  const BASE_OFFSET = 30
  const LEVEL_SPACING = 50

  // Render horizontal dimension (width) - top or bottom edge
  const renderHorizontalDimension = (rect, side) => {
    const isTop = side === 'top'
    const level = rect.staggerLevel || 0
    const offset = BASE_OFFSET + (level * LEVEL_SPACING)
    
    const dimY = isTop ? -offset : height + offset
    const textY = isTop ? dimY - 12 : dimY + 12
    const textDy = isTop ? "0em" : "0.8em"
    
    const tickStart = isTop ? 0 : height
    const tickEnd = dimY
    
    // Guide line positions
    const pieceTopY = rect.y
    const pieceBottomY = rect.y + rect.height
    
    return (
      <g key={`h-${side}-${rect.pieceId}-${rect.x}`}>
        {/* Guide lines (dotted) - from piece edge to panel edge */}
        {rect.needsGuide && (
          <>
            <line 
              x1={rect.x} y1={pieceTopY} 
              x2={rect.x} y2={tickStart} 
              stroke="#94a3b8" strokeWidth={1/scale} 
              strokeDasharray={`${4/scale} ${4/scale}`}
              opacity="0.6"
            />
            <line 
              x1={rect.x + rect.width} y1={pieceTopY} 
              x2={rect.x + rect.width} y2={tickStart} 
              stroke="#94a3b8" strokeWidth={1/scale} 
              strokeDasharray={`${4/scale} ${4/scale}`}
              opacity="0.6"
            />
          </>
        )}
        
        {/* Extension ticks */}
        <line x1={rect.x} y1={tickStart} x2={rect.x} y2={tickEnd} stroke="#475569" strokeWidth={1.5/scale} />
        <line x1={rect.x + rect.width} y1={tickStart} x2={rect.x + rect.width} y2={tickEnd} stroke="#475569" strokeWidth={1.5/scale} />
        
        {/* Dimension line with arrows */}
        <line 
          x1={rect.x + 3/scale} y1={dimY} 
          x2={rect.x + rect.width - 3/scale} y2={dimY} 
          stroke="#1e293b" strokeWidth={1.5/scale} 
          markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" 
        />
        
        {/* Dimension text */}
        <text
          x={rect.x + rect.width / 2}
          y={textY}
          dy={textDy}
          textAnchor="middle"
          className="pointer-events-none select-none"
          fontSize={14/scale}
          fontWeight="700"
          fontFamily="monospace"
          fill="#1e293b"
        >
          {Math.round(rect.width)}
        </text>
      </g>
    )
  }

  // Render vertical dimension (height) - left or right edge
  const renderVerticalDimension = (rect, side) => {
    const isLeft = side === 'left'
    const level = rect.staggerLevel || 0
    const offset = BASE_OFFSET + (level * LEVEL_SPACING)
    
    const dimX = isLeft ? -offset : width + offset
    const textX = isLeft ? dimX - 12 : dimX + 12
    
    const tickStart = isLeft ? 0 : width
    const tickEnd = dimX
    
    // Guide line positions
    const pieceLeftX = rect.x
    const pieceRightX = rect.x + rect.width
    
    return (
      <g key={`v-${side}-${rect.pieceId}-${rect.y}`}>
        {/* Guide lines (dotted) - from piece edge to panel edge */}
        {rect.needsGuide && (
          <>
            <line 
              x1={pieceLeftX} y1={rect.y} 
              x2={tickStart} y2={rect.y} 
              stroke="#94a3b8" strokeWidth={1/scale} 
              strokeDasharray={`${4/scale} ${4/scale}`}
              opacity="0.6"
            />
            <line 
              x1={pieceLeftX} y1={rect.y + rect.height} 
              x2={tickStart} y2={rect.y + rect.height} 
              stroke="#94a3b8" strokeWidth={1/scale} 
              strokeDasharray={`${4/scale} ${4/scale}`}
              opacity="0.6"
            />
          </>
        )}
        
        {/* Extension ticks */}
        <line x1={tickStart} y1={rect.y} x2={tickEnd} y2={rect.y} stroke="#475569" strokeWidth={1.5/scale} />
        <line x1={tickStart} y1={rect.y + rect.height} x2={tickEnd} y2={rect.y + rect.height} stroke="#475569" strokeWidth={1.5/scale} />
        
        {/* Dimension line with arrows */}
        <line 
          x1={dimX} y1={rect.y + 3/scale} 
          x2={dimX} y2={rect.y + rect.height - 3/scale} 
          stroke="#1e293b" strokeWidth={1.5/scale} 
          markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" 
        />
        
        {/* Dimension text (rotated) */}
        <text
          x={textX}
          y={rect.y + rect.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none"
          fontSize={14/scale}
          fontWeight="700"
          fontFamily="monospace"
          fill="#1e293b"
          transform={`rotate(${isLeft ? -90 : 90}, ${textX}, ${rect.y + rect.height / 2})`}
        >
          {Math.round(rect.height)}
        </text>
      </g>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background shadow-sm">
      <VisualizationToolbar
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        showDimensions={showDimensions}
        onToggleDimensions={(checked) => setShowDimensions(checked)}
        showIDs={showIDs}
        onToggleIDs={(checked) => setShowIDs(checked)}
        showWaste={showWaste}
        onToggleWaste={(checked) => setShowWaste(checked)}
        showPoignet={showPoignet}
        onTogglePoignet={(checked) => setShowPoignet(checked)}
        poignetActive={poignetEnabled}
        onExport={handleExport}
      />

      <div 
        ref={containerRef}
        className="relative w-full bg-slate-50 overflow-hidden cursor-move"
        style={{ 
          aspectRatio: `${totalWidth} / ${totalHeight}`,
          maxHeight: '70vh',
          minHeight: '350px'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <div 
          className="absolute origin-top-left transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
          }}
        >
          <svg
            ref={svgRef}
            width={totalWidth}
            height={totalHeight}
            viewBox={`-${RULER_PADDING} -${RULER_PADDING} ${totalWidth} ${totalHeight}`}
            className="bg-white"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <marker id="arrow-start" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M8,0 L0,4 L8,8" fill="#1e293b" strokeWidth="0" />
              </marker>
              <marker id="arrow-end" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,4 L0,8" fill="#1e293b" strokeWidth="0" />
              </marker>
            </defs>

            {/* Panel Outline */}
            <rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill="white"
              stroke="#334155"
              strokeWidth={2 / scale}
            />

            {/* Poignet Zones */}
            {poignetEnabled && showPoignet && (
              <>
                <line x1="0" y1="0" x2={width} y2="0" stroke="#3b82f6" strokeWidth={4 / scale} strokeDasharray={`${12 / scale} ${6 / scale}`} opacity="0.6" />
                <line x1="0" y1={height} x2={width} y2={height} stroke="#3b82f6" strokeWidth={4 / scale} strokeDasharray={`${12 / scale} ${6 / scale}`} opacity="0.6" />
              </>
            )}

            {/* Free/Waste Rects */}
            {showWaste && panel.freeRects && panel.freeRects.map((rect, i) => (
              <rect
                key={`free-${i}`}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill="rgba(148, 163, 184, 0.15)"
                stroke="#94a3b8"
                strokeWidth={1 / scale}
                strokeDasharray={`${4 / scale} ${4 / scale}`}
              />
            ))}

            {/* Placed Pieces */}
            {panel.placed.map((rect, i) => {
              const color = getPieceTypeColor(rect.pieceTypeId)
              const isHovered = hoveredPiece === rect
              const fontSize = Math.min(Math.max(14/scale, 10), rect.width * 0.15, rect.height * 0.25)
              const showLabel = rect.width * scale > 25 && rect.height * scale > 20

              return (
                <g 
                  key={`placed-${i}`}
                  onMouseEnter={() => setHoveredPiece(rect)}
                  onMouseLeave={() => setHoveredPiece(null)}
                  className="transition-opacity"
                  style={{ opacity: hoveredPiece && !isHovered ? 0.6 : 1 }}
                >
                  <rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill={color}
                    stroke={isHovered ? "#000" : "#475569"}
                    strokeWidth={(isHovered ? 2.5 : 1) / scale}
                  />

                  {/* ID Label */}
                  {showIDs && showLabel && (
                    <text
                      x={rect.x + rect.width / 2}
                      y={rect.y + rect.height / 2}
                      dy="0.35em"
                      textAnchor="middle"
                      className="fill-slate-700 pointer-events-none select-none"
                      fontSize={fontSize}
                      fontWeight="600"
                    >
                      #{rect.pieceId + 1}
                    </text>
                  )}
                </g>
              )
            })}

            {/* External Dimensions Layer - rendered on top */}
            {showDimensions && (
              <g className="external-dimensions">
                {/* Top edge - all piece widths */}
                {topPieces.map(rect => renderHorizontalDimension(rect, 'top'))}
                
                {/* Bottom edge - pieces touching bottom */}
                {bottomPieces.map(rect => renderHorizontalDimension(rect, 'bottom'))}
                
                {/* Left edge - all piece heights */}
                {leftPieces.map(rect => renderVerticalDimension(rect, 'left'))}
                
                {/* Right edge - pieces touching right */}
                {rightPieces.map(rect => renderVerticalDimension(rect, 'right'))}
              </g>
            )}
          </svg>
        </div>

        {/* Hover Tooltip */}
        {hoveredPiece && (
          <div 
            className="absolute z-10 p-2 bg-popover text-popover-foreground rounded-md shadow-lg border text-sm pointer-events-none"
            style={{
              left: (hoveredPiece.x * scale) + position.x + (hoveredPiece.width * scale / 2),
              top: (hoveredPiece.y * scale) + position.y - 10,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-semibold">Pièce #{hoveredPiece.pieceId + 1}</div>
            <div className="text-muted-foreground">
              {Math.round(hoveredPiece.width)} × {Math.round(hoveredPiece.height)} mm
            </div>
            {hoveredPiece.rotated && <div className="text-amber-600 text-xs">Tourné</div>}
            <div className="text-xs mt-1 font-mono">
              X : {Math.round(hoveredPiece.x)}, Y : {Math.round(hoveredPiece.y)}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-muted/10 p-2 text-xs text-muted-foreground flex justify-between border-t">
         <span>{panel.placed.length} pièce{panel.placed.length !== 1 ? 's' : ''} placée{panel.placed.length !== 1 ? 's' : ''}</span>
         <span>Glisser pour déplacer • Ctrl+Molette pour zoomer</span>
      </div>
    </div>
  )
}
