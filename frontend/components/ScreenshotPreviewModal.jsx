"use client";

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function ScreenshotPreviewModal({ isOpen, onClose, screenshotPath }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 overflow-hidden">
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">Website Screenshot Preview</DialogTitle>
        
        <div className="relative w-full h-[calc(90vh-2rem)] flex flex-col min-h-0">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-card/90 hover:bg-card rounded-full p-2 shadow-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Screenshot container - only this scrolls */}
          <div className="flex-1 min-h-0 bg-black/5 p-4">
            <div className="h-full overflow-y-auto bg-card rounded-lg shadow-inner">
              {screenshotPath && (
                <div className="flex justify-center py-4">
                  <img
                    src={screenshotPath}
                    alt="Full website screenshot"
                    className="max-w-full h-auto object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
