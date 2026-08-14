import './AdvanceScreen.css'

export default function AdvanceScreen({ onAdvance }) {
  return (
    <div className="advance">
      <button className="advance__button" onClick={onAdvance}>
        Avançar
      </button>
    </div>
  )
}
