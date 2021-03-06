import React, {Component} from 'react'
import Quote from './components/Quote'
import Filters from './components/Filters'
import findProp from './helpers/findProp'
import './App.css'

const url = "https://raw.githubusercontent.com/skolakoda/skolakoda.github.io/master/_data/quotes.json"

class App extends Component {

  constructor() {
    super()
    this.state = {
      citati: [],
      autori: new Set(),
      filtrirano: [],
      slikeAutora: new Map(),
      engleski: false
    }
  }

  componentDidMount() {
    fetch(url)
    .then(odgovor => odgovor.json())
    .then(odgovor => {
      const citati = odgovor.sort(() => .5 - Math.random())
      const filtrirano = citati.filter(x => Math.random() > .9)
      const autori = new Set(citati.map(citat => citat.autor))
      this.setState(() => ({citati, filtrirano, autori}))

      for (const autor of autori) {
        fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${autor}&prop=pageimages&format=json&pithumbsize=50&origin=*`)
        .then(odgovor => odgovor.json())
        .then(obj => {
          const slika = findProp(obj, 'source') || ''
          const slikeAutora = new Map(this.state.slikeAutora).set(autor, slika)
          this.setState(() => ({slikeAutora}))
        })
      }
    })
  }

  filtriraj = filteri => {
    const jezik = this.state.engleski ? 'en' : 'tekst'
    const filtrirano = this.state.citati.filter(citat =>
      (citat.autor === filteri.autor || filteri.autor === '')
      && (jezik in citat)
      && citat[jezik].toLowerCase().includes(filteri.tekst.toLowerCase())
    )
    this.setState(() => ({filtrirano}))
  }
  changeToEng = () =>{
    this.setState({
      engleski: true
    })
  }
  changeToSrb = () => {
    this.setState({
      engleski: false
    })
  }
  render() {
    const citati = this.state.filtrirano.map((citat, i) =>
      <Quote key={i} tekst={this.state.engleski ? citat.en : citat.tekst} autor={citat.autor} slika={this.state.slikeAutora.get(citat.autor)} />
    )
    return (
      <div className="App">
        <Filters autori={this.state.autori} slikeAutora={this.state.slikeAutora} filtriraj={this.filtriraj} engleski={this.state.engleski}/>
        <main>
          <button onClick={this.changeToSrb} className="langBtn">SRB</button>
          <button onClick={this.changeToEng} className="langBtn">ENG</button>
          <h1>{this.state.engleski ? 'Programming quotes' : 'Programerski citati'}</h1>
          {citati}
        </main>
      </div>
    )
  }
}

export default App
