const Card = (cardSubtitle) => {
  return (
    <div className="card">
      <div className="card-content">
        <h3 className="card-title">I know exactly what I'm doing</h3>
        <h4 className="card-subtitle" ref={cardSubtitle}></h4>
      </div>
      <i className="fa-solid fa-hat-witch card-icon"></i>
    </div>
  );
};

export default Card;
