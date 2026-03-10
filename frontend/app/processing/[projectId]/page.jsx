import ProcessingProjectPageClient from './client';

// Server component - async to unwrap params
export default async function ProcessingProjectPage({ params }) {
  const { projectId } = await params;
  
  // Client component wrapper for authentication and routing logic
  return <ProcessingProjectPageClient projectId={projectId} />;
}
