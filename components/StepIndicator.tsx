"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step < currentStep
                    ? "bg-[#0F6E56] text-white"
                    : step === currentStep
                    ? "bg-[#0F6E56] text-white ring-4 ring-[#E1F5EE]"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step < currentStep ? "✓" : step}
              </div>
              {labels && (
                <span
                  className={`text-xs mt-1 text-center hidden sm:block ${
                    step === currentStep ? "text-[#0F6E56] font-medium" : "text-gray-400"
                  }`}
                >
                  {labels[step - 1]}
                </span>
              )}
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition-all ${
                  step < currentStep ? "bg-[#0F6E56]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center mt-1">
        Paso {currentStep} de {totalSteps}
      </p>
    </div>
  );
}
