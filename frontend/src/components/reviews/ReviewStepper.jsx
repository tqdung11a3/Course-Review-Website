export function ReviewStepper({ currentStep, steps }) {
  return (
    <div className="review-stepper">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;
        return (
          <div key={step.id} className="review-stepper-item">
            <div
              className={`review-stepper-circle ${
                isActive || isDone ? "review-stepper-circle--active" : ""
              }`}
            >
              {step.id}
            </div>
            <span
              className={`review-stepper-label ${
                isActive || isDone ? "review-stepper-label--active" : ""
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`review-stepper-line ${
                  isDone ? "review-stepper-line--active" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
