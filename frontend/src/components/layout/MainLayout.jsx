import Navbar from './Navbar'
import Sidebar from './Sidebar'
import PageContainer from '../common/PageContainer'

function MainLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="content-layout">
        <Sidebar />

        <PageContainer>
          {children}
        </PageContainer>
      </div>
    </div>
  )
}

export default MainLayout