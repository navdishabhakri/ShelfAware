/** Black box-number tag ("BOX-014"). Loose stock gets a dashed tag with `looseLabel`. */
export function BoxId({ box, looseLabel = 'No box' }) {
  return <span className={`boxid${box.loose ? ' none' : ''}`}>{box.loose ? looseLabel : box.id}</span>;
}
