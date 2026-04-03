import OpportunityPostsBoard from '../components/OpportunityPostsBoard'

function Scholarships() {
  return (
    <OpportunityPostsBoard
      postType="scholarship"
      pageTitle="Scholarship Opportunities"
      pageDescription="Find and share scholarships that help the CUET community grow"
      providerLabel="Provider Name"
      createButtonLabel="Post a Scholarship"
      emptyStateMessage="No scholarships posted yet. Be the first to share one."
    />
  )
}

export default Scholarships
