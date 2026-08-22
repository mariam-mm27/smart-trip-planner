import { useState } from "react";
import { FiMail } from "react-icons/fi";
import styles from "./Contact.module.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitted(false);

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>GET IN TOUCH</p>

        <h1>
          Contact <span>Smart Trip Planner</span>
        </h1>

        <p className={styles.subtitle}>
          Have a question, suggestion, or feedback? Send us a message and
          we&apos;ll be happy to hear from you.
        </p>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.infoCard}>
          <div className={styles.icon}>
            <FiMail />
          </div>

          <h2>Let&apos;s talk</h2>

          <p className={styles.infoDescription}>
            Whether you need help with your trip planning experience or want to
            share your feedback, we&apos;re here to help.
          </p>

          <div className={styles.infoItem}>
            <strong>Email</strong>
            <span>support@smarttripplanner.com</span>
          </div>

          <div className={styles.infoItem}>
            <strong>Response Time</strong>
            <span>Usually within 24 hours</span>
          </div>
        </div>

        <div className={styles.formCard}>
          <h2>Send us a message</h2>

          {submitted && (
            <div className={styles.successMessage}>
              Your message has been sent successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="name">Name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? styles.inputError : ""}
                />

                {errors.name && (
                  <span className={styles.error}>{errors.name}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? styles.inputError : ""}
                />

                {errors.email && (
                  <span className={styles.error}>{errors.email}</span>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="subject">Subject</label>

              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="What is your message about?"
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? styles.inputError : ""}
              />

              {errors.subject && (
                <span className={styles.error}>{errors.subject}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="message">Message</label>

              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? styles.inputError : ""}
              />

              {errors.message && (
                <span className={styles.error}>{errors.message}</span>
              )}
            </div>

            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
