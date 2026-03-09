function BaseCard({ children, className = '' }) {
  return (
    <div className={`card-base ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ children, className = '' }) {
  return <div className={`card-header ${className}`}>{children}</div>
}

function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`}>{children}</div>
}

function CardFooter({ children, className = '' }) {
  return <div className={`card-footer ${className}`}>{children}</div>
}

BaseCard.Header = CardHeader
BaseCard.Body = CardBody
BaseCard.Footer = CardFooter

export default BaseCard
