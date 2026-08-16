import React, { useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import styles from './PlaceCard.module.css'

export default function PlaceCard(prop) {

  const [isFavorite, setIsFavorite] = useState(false);

  function handleFavorite() {
    setIsFavorite(!isFavorite);
  }

  return <>
    
    <div className={styles["place-card"]}>
      <div className={styles["card-image"]}>
        <img src={prop.image} alt="" />
        <span className={styles["category"]}>
          {prop.imgTitle}
        </span>
        <button
          className={styles["favorite-btn"]}
          onClick={handleFavorite}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className={styles["card-content"]}>
        <h2 className={styles["card-title"]}>{prop.title}</h2>
        <p className={styles["card-description"]}>{prop.description}</p>
        <div className={styles["card-location"]}><FaLocationDot />{prop.location}</div>
        <hr />
        <div className={styles["card-bottom"]}>

          <div className={styles["card-rating"]}>
            <FaRegStar className={styles["star-icon"]} />
            <span className={styles["stars"]} >{prop.stars}</span>
          </div>

          <span className={styles["plan-btn"]}>
            Plan Route
          </span>

        </div>
      </div>
    </div>
  
  
  </>
}
