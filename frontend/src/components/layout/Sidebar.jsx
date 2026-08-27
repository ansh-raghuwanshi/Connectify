import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <Link to="/home">Home</Link>
        <Link to="/alumni">Alumni</Link>
        <Link to="/events">Events</Link>
        <Link to="/profile">Profile</Link>
      </nav>
    </aside>
  )
}

export default Sidebar