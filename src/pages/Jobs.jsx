import OpportunityPostsBoard from '../components/OpportunityPostsBoard'

function Jobs() {
  return (
    <OpportunityPostsBoard
      postType="job"
      pageTitle="Job Opportunities"
      pageDescription="Explore and share career opportunities within the CUET community"
      providerLabel="Company Name"
      createButtonLabel="Post a Job"
      emptyStateMessage="No jobs posted yet. Be the first to share one."
    />
  )
}

export default Jobs
