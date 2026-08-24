import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.notFoundPage}>
      <div className={styles.notFoundContent}>
        <h1>404</h1>

        <h2>Page Not Found</h2>

        <p>
          Sorry, the page you're looking for doesn't exist.
        </p>

        <Link to="/" className={styles.backHomeBtn}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}