"use client";

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function ScreenshotPreviewModal({ isOpen, onClose, screenshotPath }) {
  // Return null if no screenshot path or screenshots disabled
  if (!screenshotPath) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full p-6">
          <DialogTitle className="sr-only">Website Screenshot Preview</DialogTitle>
          <div className="text-center text-muted-foreground">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p>Screenshot functionality disabled for performance</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
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
              {!screenshotPath && (
                <div className="flex justify-center py-8 text-muted-foreground">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Screenshot functionality disabled for performance</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
