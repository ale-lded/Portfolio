import { About } from './components/About'
import { Contact } from './components/Contact'
import { Nav } from './components/Nav'
import { Stage } from './components/stage/Stage'

export default function App() {
  return (
    <>
      <span id="top" />
      <Nav />
      <main>
        <Stage />
        <About />
        <Contact />
      </main>
    </>
  )
}
