"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PageDetailsContent from './PageDetailsContent';

const PageDetailsModal = ({ isOpen, toggle, projectId, pageUrl }) => {
  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogContent className="max-w-[1200px] max-h-[85vh] p-0 overflow-hidden">
        {/* Hidden accessibility elements */}
        <DialogTitle className="sr-only">Page Details</DialogTitle>
        <DialogDescription className="sr-only">
          Detailed information about the page including screenshot, metadata, and SEO issues
        </DialogDescription>
        
        <PageDetailsContent 
          projectId={projectId} 
          pageUrl={pageUrl} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default PageDetailsModal;
