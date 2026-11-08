import { About } from './components/About'
import { Backstage } from './components/backstage/Backstage'
import { Contact } from './components/Contact'
import { Nav } from './components/Nav'
import { Services } from './components/Services'
import { StackStage } from './components/stack/StackStage'
import { Stage } from './components/stage/Stage'
import { TerminalHost } from './components/terminal/TerminalHost'

export default function App() {
  return (
    <>
      <span id="top" />
      <Nav />
      <main>
        <Stage />
        <About />
        <Services />
        <StackStage />
        <Contact />
      </main>
      <Backstage />
      <TerminalHost />
    </>
  )
}
