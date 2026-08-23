import { Card, Col, Row, Button, Form } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import styles from "./ItineraryPreview.module.css";

export default function ItineraryPreview({
  itinerary,
  onRemovePlace,
  onMovePlace,
}) {
  if (!itinerary?.length) {
    return null;
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Your Suggested Itinerary</h2>

      <Row className="g-4">
        {itinerary.map((day) => (
          <Col key={day.day} xs={12} md={6}>
            <Card className={styles.dayCard}>
              <Card.Body>
                <Card.Title className={styles.dayTitle}>
                  Day {day.day}
                </Card.Title>

                {day.places.length > 0 ? (
                  <div>
                    {day.places.map((place) => (
                      <div className={styles.place} key={place.id}>
                        <div className={styles.placeInfo}>
                          <h3>{place.title}</h3>

                          <span>{place.category}</span>

                          <span className={styles.rating}>
                            ★ {place.rating}
                          </span>
                        </div>

                        <div className={styles.actions}>
                          <Form.Select
                            size="sm"
                            className={styles.moveSelect}
                            defaultValue=""
                            onChange={(event) => {
                              if (!event.target.value) {
                                return;
                              }

                              onMovePlace(
                                place.id,
                                day.day,
                                Number(event.target.value),
                              );

                              event.target.value = "";
                            }}
                          >
                            <option value="">Move</option>

                            {itinerary
                              .filter((targetDay) => targetDay.day !== day.day)
                              .map((targetDay) => (
                                <option
                                  key={targetDay.day}
                                  value={targetDay.day}
                                >
                                  Day {targetDay.day}
                                </option>
                              ))}
                          </Form.Select>

                          <Button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => onRemovePlace(place.id, day.day)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.empty}>
                    No places suggested for this day.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
