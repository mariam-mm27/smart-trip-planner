import { useState } from "react";
import { FiMail } from "react-icons/fi";
import styles from "./Contact.module.css";
import { useLanguage } from "../../context/LanguageContext";
import { sendContactMessage } from "../../services/contactService";

export default function Contact() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitted(false);
    setSendError("");

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("nameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("invalidEmail");
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t("subjectRequired");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("messageRequired");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("messageMinLength");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSending(true);
    setSubmitted(false);
    setSendError("");

    try {
      await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending contact message:", error);
      setSendError(t("messageFailed"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{t("getInTouch")}</p>

        <h1>{t("contactTitle")}</h1>

        <p className={styles.subtitle}>{t("contactSubtitle")}</p>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        {/* Contact Info */}
        <div className={styles.infoCard}>
          <div className={styles.icon}>
            <FiMail />
          </div>

          <h2>{t("letsTalk")}</h2>

          <p className={styles.infoDescription}>{t("contactDescription")}</p>

          <div className={styles.infoItem}>
            <strong>{t("email")}</strong>
            <span>support@smarttripplanner.com</span>
          </div>

          <div className={styles.infoItem}>
            <strong>{t("responseTime")}</strong>
            <span>{t("within24Hours")}</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formCard}>
          <h2>{t("sendUsMessage")}</h2>

          {submitted && (
            <div className={styles.successMessage}>{t("messageSent")}</div>
          )}

          {sendError && (
            <div className={styles.errorMessage} role="alert">
              {sendError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="name">{t("name")}</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t("enterName")}
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? styles.inputError : ""}
                />

                {errors.name && (
                  <span className={styles.error}>{errors.name}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="email">{t("email")}</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("enterEmail")}
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
              <label htmlFor="subject">{t("subject")}</label>

              <input
                id="subject"
                name="subject"
                type="text"
                placeholder={t("messageSubjectPlaceholder")}
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? styles.inputError : ""}
              />

              {errors.subject && (
                <span className={styles.error}>{errors.subject}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="message">{t("message")}</label>

              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder={t("messagePlaceholder")}
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? styles.inputError : ""}
              />

              {errors.message && (
                <span className={styles.error}>{errors.message}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSending}
            >
              {isSending ? t("sending") : t("sendMessage")}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
