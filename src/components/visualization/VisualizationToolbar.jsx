import React from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Download, 
  Ruler, 
  Hash, 
  Trash2, 
  Layers 
} from 'lucide-react'

export function VisualizationToolbar({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  showDimensions,
  onToggleDimensions,
  showIDs,
  onToggleIDs,
  showWaste,
  onToggleWaste,
  showPoignet,
  onTogglePoignet,
  poignetActive,
  onExport
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b bg-muted/20">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onZoomOut} title="Dézoomer">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-mono w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button variant="ghost" size="icon" onClick={onZoomIn} title="Zoomer">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onReset} title="Réinitialiser la vue">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox 
            id="viz-dims" 
            checked={showDimensions} 
            onChange={(e) => onToggleDimensions(e.target.checked)}
          />
          <span className="text-xs flex items-center gap-1">
            <Ruler className="h-3 w-3" /> Dimensions
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox 
            id="viz-ids" 
            checked={showIDs} 
            onChange={(e) => onToggleIDs(e.target.checked)}
          />
          <span className="text-xs flex items-center gap-1">
            <Hash className="h-3 w-3" /> Identifiants
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox 
            id="viz-waste" 
            checked={showWaste} 
            onChange={(e) => onToggleWaste(e.target.checked)}
          />
          <span className="text-xs flex items-center gap-1">
            <Trash2 className="h-3 w-3" /> Chutes
          </span>
        </label>

        {poignetActive && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox 
              id="viz-poignet" 
              checked={showPoignet} 
              onChange={(e) => onTogglePoignet(e.target.checked)}
            />
            <span className="text-xs flex items-center gap-1 text-blue-600 font-medium">
              <Layers className="h-3 w-3" /> Poignet
            </span>
          </label>
        )}
      </div>

      {/* Export */}
      <div>
        <Button variant="outline" size="sm" onClick={onExport} className="h-8 gap-2">
          <Download className="h-3 w-3" />
          Exporter SVG
        </Button>
      </div>
    </div>
  )
}
