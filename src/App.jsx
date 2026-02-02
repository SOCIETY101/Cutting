import { useState, useEffect } from 'react'
import { optimize } from './optimizer'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Checkbox } from './components/ui/checkbox'
import { Plus, Trash2, Copy, Download, Upload } from 'lucide-react'

function App() {
  // Panel state
  const [panelWidth, setPanelWidth] = useState(1000)
  const [panelHeight, setPanelHeight] = useState(1000)

  // Pieces state (rotation enabled by default for better optimization)
  const [pieces, setPieces] = useState([
    { id: 0, width: 200, height: 150, quantity: 5, rotationAllowed: true },
    { id: 1, width: 100, height: 100, quantity: 10, rotationAllowed: true },
  ])
  
  // Optimization settings
  const [minWasteSize, setMinWasteSize] = useState(100) // mm - waste smaller than this is trash

  // Results state
  const [results, setResults] = useState(null)
  const [showFreeRects, setShowFreeRects] = useState(false)
  
  // JSON config state
  const [jsonConfig, setJsonConfig] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [autoSync, setAutoSync] = useState(true)

  // Auto-sync JSON when form changes (if auto-sync is enabled)
  useEffect(() => {
    if (autoSync) {
      const config = {
        panel: {
          width: panelWidth,
          height: panelHeight,
        },
        settings: {
          minWasteSize: minWasteSize,
        },
        pieces: pieces.map(p => ({
          id: p.id,
          width: p.width,
          height: p.height,
          quantity: p.quantity,
          rotationAllowed: p.rotationAllowed,
        })),
      }
      setJsonConfig(JSON.stringify(config, null, 2))
      setJsonError('')
    }
  }, [panelWidth, panelHeight, pieces, minWasteSize, autoSync])

  // Generate color for piece type (same color for all pieces of same type)
  const getPieceTypeColor = (pieceTypeId) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
      '#f43f5e', '#8b5a2b', '#64748b', '#14b8a6', '#a855f7',
    ]
    return colors[pieceTypeId % colors.length]
  }

  // Handle optimization
  const handleOptimize = () => {
    const result = optimize(panelWidth, panelHeight, pieces, { minWasteSize })
    setResults(result)
  }

  // Handle reset
  const handleReset = () => {
    setPanelWidth(1000)
    setPanelHeight(1000)
    setPieces([
      { id: 0, width: 200, height: 150, quantity: 5, rotationAllowed: true },
      { id: 1, width: 100, height: 100, quantity: 10, rotationAllowed: true },
    ])
    setMinWasteSize(100)
    setResults(null)
    setShowFreeRects(false)
  }

  // Add new piece (rotation enabled by default)
  const handleAddPiece = () => {
    const newId = Math.max(...pieces.map(p => p.id), -1) + 1
    setPieces([
      ...pieces,
      { id: newId, width: 100, height: 100, quantity: 1, rotationAllowed: true },
    ])
  }

  // Remove piece
  const handleRemovePiece = (id) => {
    setPieces(pieces.filter(p => p.id !== id))
  }

  // Update piece
  const handleUpdatePiece = (id, field, value) => {
    setPieces(
      pieces.map(p =>
        p.id === id ? { ...p, [field]: field === 'rotationAllowed' ? value : Number(value) } : p
      )
    )
  }

  // Calculate SVG scale for visualization
  const getSVGScale = () => {
    if (!results) return 1
    const maxDimension = Math.max(panelWidth, panelHeight)
    const svgSize = 600 // SVG viewport size
    return svgSize / maxDimension
  }

  // Export current configuration to JSON
  const exportToJSON = () => {
    const config = {
      panel: {
        width: panelWidth,
        height: panelHeight,
      },
      settings: {
        minWasteSize: minWasteSize,
      },
      pieces: pieces.map(p => ({
        id: p.id,
        width: p.width,
        height: p.height,
        quantity: p.quantity,
        rotationAllowed: p.rotationAllowed,
      })),
    }
    const jsonString = JSON.stringify(config, null, 2)
    setJsonConfig(jsonString)
    setJsonError('')
    return jsonString
  }

  // Import configuration from JSON
  const importFromJSON = () => {
    try {
      setJsonError('')
      const config = JSON.parse(jsonConfig)
      
      // Validate structure
      if (!config.panel || typeof config.panel.width !== 'number' || typeof config.panel.height !== 'number') {
        throw new Error('Invalid panel configuration')
      }
      
      if (!Array.isArray(config.pieces)) {
        throw new Error('Pieces must be an array')
      }
      
      // Validate and import pieces (default rotationAllowed to true for wood cutting)
      const importedPieces = config.pieces.map((p, index) => ({
        id: p.id !== undefined ? p.id : index,
        width: Number(p.width),
        height: Number(p.height),
        quantity: Number(p.quantity),
        rotationAllowed: p.rotationAllowed !== undefined ? Boolean(p.rotationAllowed) : true,
      }))
      
      // Set the configuration
      setPanelWidth(config.panel.width)
      setPanelHeight(config.panel.height)
      setPieces(importedPieces)
      
      // Import settings if available
      if (config.settings && typeof config.settings.minWasteSize === 'number') {
        setMinWasteSize(config.settings.minWasteSize)
      }
      
      setJsonError('')
      setAutoSync(true) // Re-enable auto-sync after import
      
      return true
    } catch (error) {
      setJsonError(error.message || 'Invalid JSON format')
      return false
    }
  }

  // Copy JSON to clipboard
  const copyToClipboard = async () => {
    const json = exportToJSON()
    try {
      await navigator.clipboard.writeText(json)
      setJsonError('')
      // You could add a toast notification here
    } catch (error) {
      setJsonError('Failed to copy to clipboard')
    }
  }

  // Load example configuration
  const loadExample = () => {
    const example = {
      panel: {
        width: 2440,
        height: 1220,
      },
      settings: {
        minWasteSize: 100,
      },
      pieces: [
        { id: 0, width: 600, height: 400, quantity: 8, rotationAllowed: true },
        { id: 1, width: 300, height: 200, quantity: 12, rotationAllowed: true },
        { id: 2, width: 150, height: 150, quantity: 10, rotationAllowed: true },
      ],
    }
    setJsonConfig(JSON.stringify(example, null, 2))
    setJsonError('')
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">2D Cutting Optimization</h1>
          <p className="text-muted-foreground">
            Guillotine-based MaxRects Bin Packing Algorithm
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Input Forms */}
          <div className="space-y-6">
            {/* JSON Configuration Panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>JSON Configuration</CardTitle>
                    <CardDescription>Copy/paste configuration for quick testing</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportToJSON} size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button onClick={loadExample} size="sm" variant="outline">
                      Example
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="auto-sync"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                  />
                  <Label htmlFor="auto-sync" className="text-sm cursor-pointer">
                    Auto-sync with form (updates JSON as you edit)
                  </Label>
                </div>
                <div className="relative">
                  <textarea
                    value={jsonConfig}
                    onChange={(e) => {
                      setJsonConfig(e.target.value)
                      setJsonError('')
                      if (autoSync) {
                        setAutoSync(false) // Disable auto-sync when user manually edits JSON
                      }
                    }}
                    placeholder={`{\n  "panel": {\n    "width": 1000,\n    "height": 1000\n  },\n  "pieces": [\n    {\n      "id": 0,\n      "width": 200,\n      "height": 300,\n      "quantity": 15,\n      "rotationAllowed": true\n    }\n  ]\n}`}
                    className="w-full h-64 p-3 text-sm font-mono border border-input rounded-md bg-background text-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    spellCheck={false}
                  />
                </div>
                {jsonError && (
                  <p className="text-sm text-destructive">{jsonError}</p>
                )}
                <div className="flex gap-2">
                  <Button onClick={importFromJSON} className="flex-1" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Load Configuration
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Panel Definition */}
            <Card>
              <CardHeader>
                <CardTitle>Panel Definition</CardTitle>
                <CardDescription>Define the panel dimensions in millimeters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="panel-width">Width (mm)</Label>
                    <Input
                      id="panel-width"
                      type="number"
                      min="1"
                      value={panelWidth}
                      onChange={(e) => setPanelWidth(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panel-height">Height (mm)</Label>
                    <Input
                      id="panel-height"
                      type="number"
                      min="1"
                      value={panelHeight}
                      onChange={(e) => setPanelHeight(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="min-waste-size">Minimum Useful Waste Size (mm)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="min-waste-size"
                        type="number"
                        min="0"
                        value={minWasteSize}
                        onChange={(e) => setMinWasteSize(Number(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-xs text-muted-foreground">
                        Waste smaller than {minWasteSize}×{minWasteSize}mm is discarded
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pieces Definition */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pieces Definition</CardTitle>
                    <CardDescription>Define pieces to be cut from the panel</CardDescription>
                  </div>
                  <Button onClick={handleAddPiece} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Piece
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pieces.map((piece) => (
                  <div
                    key={piece.id}
                    className="p-4 border rounded-lg space-y-3 bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Piece #{piece.id + 1}</span>
                      <Button
                        onClick={() => handleRemovePiece(piece.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`width-${piece.id}`} className="text-xs">
                          Width (mm)
                        </Label>
                        <Input
                          id={`width-${piece.id}`}
                          type="number"
                          min="1"
                          value={piece.width}
                          onChange={(e) =>
                            handleUpdatePiece(piece.id, 'width', e.target.value)
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`height-${piece.id}`} className="text-xs">
                          Height (mm)
                        </Label>
                        <Input
                          id={`height-${piece.id}`}
                          type="number"
                          min="1"
                          value={piece.height}
                          onChange={(e) =>
                            handleUpdatePiece(piece.id, 'height', e.target.value)
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${piece.id}`} className="text-xs">
                          Quantity
                        </Label>
                        <Input
                          id={`quantity-${piece.id}`}
                          type="number"
                          min="1"
                          value={piece.quantity}
                          onChange={(e) =>
                            handleUpdatePiece(piece.id, 'quantity', e.target.value)
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`rotation-${piece.id}`}
                        checked={piece.rotationAllowed}
                        onChange={(e) =>
                          handleUpdatePiece(piece.id, 'rotationAllowed', e.target.checked)
                        }
                      />
                      <Label
                        htmlFor={`rotation-${piece.id}`}
                        className="text-sm cursor-pointer"
                      >
                        Allow rotation
                      </Label>
                    </div>
                  </div>
                ))}
                {pieces.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pieces defined. Click "Add Piece" to add one.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleOptimize} className="flex-1" size="lg">
                Generate Optimization
              </Button>
              <Button onClick={handleReset} variant="secondary" size="lg">
                Reset
              </Button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {results ? (
              <>
                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Used Area</p>
                        <p className="text-2xl font-bold">
                          {results.stats.usedPercentage.toFixed(2)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {results.stats.totalUsedArea.toFixed(0)} mm²
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Waste</p>
                        <p className="text-2xl font-bold text-destructive">
                          {results.stats.wastePercentage.toFixed(2)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {results.stats.totalWasteArea.toFixed(0)} mm²
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Panels Used: <span className="font-medium">{results.stats.panelCount}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Placed: <span className="font-medium">
                          {results.panels.reduce((sum, p) => sum + p.placed.length, 0)}
                        </span> pieces
                      </p>
                      {results.stats.usableWasteArea > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Reusable Waste: <span className="font-medium">
                            {(results.stats.usableWasteArea / 1000000).toFixed(3)} m²
                          </span>
                          <span className="text-xs ml-1">
                            ({results.panels.reduce((sum, p) => sum + p.freeRects.length, 0)} pieces)
                          </span>
                        </p>
                      )}
                      {results.rejected.length > 0 && (
                        <p className="text-sm text-destructive">
                          Rejected: <span className="font-medium">{results.rejected.length}</span>{' '}
                          pieces
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Checkbox
                        id="show-free-rects"
                        checked={showFreeRects}
                        onChange={(e) => setShowFreeRects(e.target.checked)}
                      />
                      <Label htmlFor="show-free-rects" className="text-sm cursor-pointer">
                        Show free rectangles
                      </Label>
                    </div>
                    {/* Piece Type Legend */}
                    {results.panels.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Piece Colors:</p>
                        <div className="flex flex-wrap gap-2">
                          {pieces.map((piece) => (
                            <div
                              key={piece.id}
                              className="flex items-center gap-2 text-xs"
                            >
                              <div
                                className="w-4 h-4 rounded border border-border"
                                style={{ backgroundColor: getPieceTypeColor(piece.id) }}
                              />
                              <span>Piece #{piece.id + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Visualization - Multiple Panels */}
                <Card>
                  <CardHeader>
                    <CardTitle>Visualization</CardTitle>
                    <CardDescription>
                      {results.stats.panelCount} Panel{results.stats.panelCount !== 1 ? 's' : ''}: {panelWidth}mm × {panelHeight}mm each
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {results.panels.map((panel, panelIdx) => {
                        const allPlaced = results.panels.flatMap(p => p.placed)
                        const panelPlacedCount = panel.placed.length
                        return (
                          <div key={`panel-${panelIdx}`} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold">
                                Panel {panelIdx + 1} ({panelPlacedCount} pieces)
                              </h3>
                            </div>
                            <div className="w-full flex justify-center bg-muted/30 rounded-lg p-4">
                              <svg
                                width="600"
                                height="600"
                                viewBox={`0 0 ${panelWidth} ${panelHeight}`}
                                className="border border-border rounded"
                                style={{ maxWidth: '100%', height: 'auto' }}
                              >
                                {/* Panel outline */}
                                <rect
                                  x="0"
                                  y="0"
                                  width={panelWidth}
                                  height={panelHeight}
                                  fill="white"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />

                                {/* Free rectangles (optional) */}
                                {showFreeRects &&
                                  panel.freeRects &&
                                  panel.freeRects.map((rect, index) => (
                                    <rect
                                      key={`free-${panelIdx}-${index}`}
                                      x={rect.x}
                                      y={rect.y}
                                      width={rect.width}
                                      height={rect.height}
                                      fill="none"
                                      stroke="#94a3b8"
                                      strokeWidth="1"
                                      strokeDasharray="4 4"
                                      opacity="0.5"
                                    />
                                  ))}

                                {/* Placed rectangles */}
                                {panel.placed.map((rect, index) => {
                                  const color = getPieceTypeColor(rect.pieceTypeId)
                                  return (
                                    <g key={`placed-${panelIdx}-${index}`}>
                                      <rect
                                        x={rect.x}
                                        y={rect.y}
                                        width={rect.width}
                                        height={rect.height}
                                        fill={color}
                                        fillOpacity="0.7"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                      />
                                      {/* Label with dimensions */}
                                      {rect.width > 50 && rect.height > 30 && (
                                        <text
                                          x={rect.x + rect.width / 2}
                                          y={rect.y + rect.height / 2}
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                          className="text-xs font-medium fill-foreground"
                                          fontSize="12"
                                        >
                                          {Math.round(rect.width)}×{Math.round(rect.height)}
                                          {rect.rotated && ' (R)'}
                                        </text>
                                      )}
                                    </g>
                                  )
                                })}
                              </svg>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">
                      Click "Generate Optimization" to see results
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
