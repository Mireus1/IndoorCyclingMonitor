export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: '100vh',
        width: '100vw'
      }}
    >
      <h1>404</h1>
      <p>Page Not Found</p>
      <a href='/home' className='mt-6 text-blue-500 hover:underline'>
        Go to Home
      </a>
    </div>
  )
}
