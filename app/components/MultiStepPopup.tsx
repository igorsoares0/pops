import { useState, useEffect } from "react";

interface Section {
  id: number;
  type: "intro" | "email_capture" | "custom";
  title: string;
  order: number;
  content: {
    heading: string;
    description: string;
    emailPlaceholder?: string;
    primaryButton?: string;
    secondaryButton?: string;
    buttonText?: string;
  };
}

interface PopupData {
  isMultiStep: boolean;
  sections: Section[];
  // Style properties
  popupBackground: string;
  textHeading: string;
  textDescription: string;
  textInput: string;
  primaryBtnBg: string;
  primaryBtnText: string;
  secondaryBtnText: string;
  logoUrl?: string;
  logoWidth: number;
  imageUrl?: string;
  imagePosition: string;
  displaySize: string;
  cornerRadius: string;
  alignment: string;
  footerText?: string;
  textFooter?: string;
  customButtons: any[];
  customBtnBg: string;
  customBtnText: string;
  // Discount data
  discountType: string;
  discountValue: number;
  discountCode?: string;
}

interface MultiStepPopupProps {
  popupData: PopupData;
  isVisible: boolean;
  onClose: () => void;
  onEmailSubmit: (email: string, sectionId: number) => void;
  onButtonClick: (actionType: string, sectionId: number, data?: any) => void;
}

export function MultiStepPopup({ 
  popupData, 
  isVisible, 
  onClose, 
  onEmailSubmit, 
  onButtonClick 
}: MultiStepPopupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset step when popup opens
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setEmail("");
      setIsSubmitting(false);
    }
  }, [isVisible]);

  if (!isVisible || !popupData.sections.length) return null;

  const currentSection = popupData.sections[currentStep];
  const isLastStep = currentStep === popupData.sections.length - 1;
  const isFirstStep = currentStep === 0;

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
      onButtonClick("next", currentSection.id, { fromStep: currentStep, toStep: currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
      onButtonClick("previous", currentSection.id, { fromStep: currentStep, toStep: currentStep - 1 });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onEmailSubmit(email, currentSection.id);
      
      // If this is not the last step, move to next
      if (!isLastStep) {
        setTimeout(() => {
          nextStep();
          setIsSubmitting(false);
        }, 500);
      } else {
        // Close popup after successful submission on last step
        setTimeout(() => {
          onClose();
          setIsSubmitting(false);
        }, 1000);
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handlePrimaryAction = () => {
    if (currentSection.type === "email_capture") {
      handleEmailSubmit(new Event("submit") as any);
    } else {
      if (isLastStep) {
        onButtonClick("complete", currentSection.id);
        onClose();
      } else {
        nextStep();
      }
    }
  };

  const handleSecondaryAction = () => {
    if (currentSection.type === "email_capture") {
      onButtonClick("skip_email", currentSection.id);
      if (!isLastStep) {
        nextStep();
      } else {
        onClose();
      }
    } else {
      onButtonClick("secondary", currentSection.id);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: popupData.popupBackground,
        padding: (popupData.imagePosition === "left" || popupData.imagePosition === "right") ? "0" : 
                popupData.imagePosition === "top" ? "0 32px 32px 32px" : "32px",
        borderRadius: popupData.cornerRadius === "rounded" ? "12px" : 
                    popupData.cornerRadius === "square" ? "0px" : "8px",
        maxWidth: popupData.displaySize === "large" ? "600px" : 
                 popupData.displaySize === "small" ? "400px" : "500px",
        width: "90%",
        maxHeight: "80vh",
        overflow: "auto",
        textAlign: popupData.alignment as any,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        position: "relative",
        display: "flex",
        flexDirection: popupData.imagePosition === "top" ? "column" : "row",
        alignItems: popupData.imagePosition === "left" || popupData.imagePosition === "right" ? "stretch" : "center",
        backgroundImage: popupData.imagePosition === "background" && popupData.imageUrl ? `url(${popupData.imageUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: (popupData.imagePosition === "left" || popupData.imagePosition === "right") ? "400px" : "auto"
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            zIndex: 10,
            color: popupData.imagePosition === "background" ? "#fff" : "#666",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ×
        </button>

        {/* Progress indicator for multi-step */}
        {popupData.isMultiStep && popupData.sections.length > 1 && (
          <div style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "4px",
            zIndex: 10
          }}>
            {popupData.sections.map((_, index) => (
              <div
                key={index}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: index === currentStep 
                    ? (popupData.imagePosition === "background" ? "#fff" : popupData.primaryBtnBg)
                    : (popupData.imagePosition === "background" ? "rgba(255,255,255,0.3)" : "#ddd")
                }}
              />
            ))}
          </div>
        )}

        {/* Image Left */}
        {popupData.imagePosition === "left" && popupData.imageUrl && (
          <div style={{ 
            flexShrink: 0,
            alignSelf: "stretch"
          }}>
            <img 
              src={popupData.imageUrl} 
              alt="Popup image"
              style={{
                width: "200px",
                height: "100%",
                objectFit: "cover",
                borderRadius: popupData.cornerRadius === "rounded" ? "12px 0 0 12px" : 
                            popupData.cornerRadius === "square" ? "0" : "8px 0 0 8px"
              }}
            />
          </div>
        )}
        
        {/* Image Top */}
        {popupData.imagePosition === "top" && popupData.imageUrl && (
          <div style={{ 
            order: -1,
            width: "100%"
          }}>
            <img 
              src={popupData.imageUrl} 
              alt="Popup image"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: popupData.cornerRadius === "rounded" ? "12px 12px 0 0" : 
                            popupData.cornerRadius === "square" ? "0" : "8px 8px 0 0",
                display: "block"
              }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ 
          flex: 1,
          order: popupData.imagePosition === "right" ? 1 : 2,
          padding: (popupData.imagePosition === "left" || popupData.imagePosition === "right") ? "32px" : 
                  popupData.imagePosition === "top" ? "24px 32px 32px 32px" : "0"
        }}>
          {/* Logo */}
          {popupData.logoUrl && (
            <div style={{ 
              marginBottom: "16px",
              textAlign: popupData.alignment as any
            }}>
              <img 
                src={popupData.logoUrl} 
                alt="Logo"
                style={{
                  maxWidth: `${popupData.logoWidth}%`,
                  height: "auto",
                  maxHeight: "60px"
                }}
              />
            </div>
          )}

          {/* Section Content */}
          <div style={{ 
            marginBottom: "24px",
            position: "relative",
            zIndex: popupData.imagePosition === "background" ? 5 : "auto",
            color: popupData.imagePosition === "background" ? "#fff" : "inherit",
            textShadow: popupData.imagePosition === "background" ? "0 1px 2px rgba(0,0,0,0.5)" : "none"
          }}>
            <h2 style={{ 
              fontSize: "24px", 
              fontWeight: "600", 
              marginBottom: "12px",
              color: popupData.imagePosition === "background" ? "#fff" : popupData.textHeading
            }}>
              {currentSection.content.heading}
            </h2>
            <p style={{ 
              color: popupData.imagePosition === "background" ? "#fff" : popupData.textDescription, 
              marginBottom: "0",
              fontSize: "16px"
            }}>
              {currentSection.content.description}
            </p>
          </div>

          {/* Form/Actions */}
          <div style={{ 
            marginBottom: "24px",
            position: "relative",
            zIndex: popupData.imagePosition === "background" ? 5 : "auto"
          }}>
            {currentSection.type === "email_capture" ? (
              <form onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentSection.content.emailPlaceholder || "Email address"}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "16px",
                    marginBottom: "12px",
                    color: popupData.textInput,
                    boxSizing: "border-box"
                  }}
                />
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: popupData.primaryBtnBg,
                    color: popupData.primaryBtnText,
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "6px",
                    width: "100%",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    marginBottom: "12px",
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  {isSubmitting 
                    ? "Submitting..." 
                    : (currentSection.content.primaryButton || "Claim discount")
                  }
                </button>

                {currentSection.content.secondaryButton && (
                  <button 
                    type="button"
                    onClick={handleSecondaryAction}
                    style={{
                      background: "none",
                      border: "none",
                      color: popupData.imagePosition === "background" ? "#fff" : popupData.secondaryBtnText,
                      fontSize: "14px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      width: "100%"
                    }}
                  >
                    {currentSection.content.secondaryButton}
                  </button>
                )}
              </form>
            ) : (
              <div>
                <button 
                  onClick={handlePrimaryAction}
                  style={{
                    backgroundColor: popupData.primaryBtnBg,
                    color: popupData.primaryBtnText,
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "6px",
                    width: "100%",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    marginBottom: "12px"
                  }}
                >
                  {currentSection.content.buttonText || currentSection.content.primaryButton || (isLastStep ? "Complete" : "Continue")}
                </button>

                {!isFirstStep && (
                  <button 
                    onClick={prevStep}
                    style={{
                      background: "none",
                      border: "none",
                      color: popupData.imagePosition === "background" ? "#fff" : popupData.secondaryBtnText,
                      fontSize: "14px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      width: "100%"
                    }}
                  >
                    ← Back
                  </button>
                )}
              </div>
            )}

            {/* Custom Buttons - only show on last step */}
            {isLastStep && popupData.customButtons?.map((button: any) => (
              <button 
                key={button.id}
                onClick={() => onButtonClick(button.action, currentSection.id, { url: button.url })}
                style={{
                  backgroundColor: button.style === "outline" ? "transparent" : popupData.customBtnBg,
                  color: button.style === "outline" ? popupData.customBtnBg : popupData.customBtnText,
                  border: button.style === "outline" ? `1px solid ${popupData.customBtnBg}` : "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  width: "100%",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  marginTop: "8px",
                  textDecoration: button.style === "plain" ? "underline" : "none",
                  background: button.style === "plain" ? "none" : undefined
                }}
              >
                {button.text}
              </button>
            ))}
          </div>

          {/* Footer */}
          {popupData.footerText && currentSection.type === "email_capture" && (
            <p style={{
              fontSize: "12px",
              color: popupData.imagePosition === "background" ? "#fff" : popupData.textFooter || "#999",
              lineHeight: "1.4",
              margin: "0",
              position: "relative",
              zIndex: popupData.imagePosition === "background" ? 5 : "auto"
            }}>
              {popupData.footerText}
            </p>
          )}
        </div>

        {/* Image Right */}
        {popupData.imagePosition === "right" && popupData.imageUrl && (
          <div style={{ 
            flexShrink: 0,
            order: 2,
            alignSelf: "stretch"
          }}>
            <img 
              src={popupData.imageUrl} 
              alt="Popup image"
              style={{
                width: "200px",
                height: "100%",
                objectFit: "cover",
                borderRadius: popupData.cornerRadius === "rounded" ? "0 12px 12px 0" : 
                            popupData.cornerRadius === "square" ? "0" : "0 8px 8px 0"
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}