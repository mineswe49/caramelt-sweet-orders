"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { OrderStatus } from "@/types/database";

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

interface TimelineStep {
  id: OrderStatus;
  label: string;
  order: number;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "PENDING_ADMIN_ACCEPTANCE",
    label: "Order Placed",
    order: 1,
  },
  {
    id: "ACCEPTED",
    label: "Accepted",
    order: 2,
  },
  {
    id: "PAID_CONFIRMED",
    label: "Payment Confirmed",
    order: 3,
  },
];

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const currentStep =
    TIMELINE_STEPS.find((step) => step.id === currentStatus)?.order || 1;

  const getStepStatus = (stepOrder: number) => {
    if (stepOrder < currentStep) return "completed";
    if (stepOrder === currentStep) return "current";
    return "future";
  };

  return (
    <div className="w-full" role="progressbar" aria-label="Order progress">
      {/* Desktop - Horizontal Layout */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {TIMELINE_STEPS.map((step, index) => {
            const status = getStepStatus(step.order);
            const isLast = index === TIMELINE_STEPS.length - 1;

            return (
              <div key={step.id} className="flex-1 relative">
                <div className="flex items-center">
                  {/* Step Circle */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.3 }}
                    className="relative z-10"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-300 ${
                        status === "completed"
                          ? "bg-gradient-to-br from-primary to-secondary"
                          : status === "current"
                          ? "bg-gradient-to-br from-primary to-secondary"
                          : "bg-gray-200"
                      }`}
                    >
                      {status === "completed" ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : status === "current" ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut",
                          }}
                          className="w-3 h-3 bg-white rounded-full"
                        />
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      )}
                    </div>

                    {/* Pulsing Ring for Current Step */}
                    {status === "current" && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-full bg-primary"
                      />
                    )}
                  </motion.div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.2 + 0.1, duration: 0.4 }}
                      className="flex-1 h-1 mx-2 origin-left"
                    >
                      <div
                        className={`h-full transition-all duration-500 ${
                          status === "completed"
                            ? "bg-gradient-to-r from-primary to-secondary"
                            : "bg-gray-200 border-t-2 border-dashed border-gray-300"
                        }`}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Step Label */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.2, duration: 0.3 }}
                  className={`mt-4 text-sm font-medium text-center ${
                    status === "future" ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {step.label}
                </motion.p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile - Vertical Layout */}
      <div className="md:hidden space-y-6">
        {TIMELINE_STEPS.map((step, index) => {
          const status = getStepStatus(step.order);
          const isLast = index === TIMELINE_STEPS.length - 1;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.3 }}
              className="flex items-start gap-4"
            >
              {/* Circle and Line Container */}
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-300 ${
                      status === "completed"
                        ? "bg-gradient-to-br from-primary to-secondary"
                        : status === "current"
                        ? "bg-gradient-to-br from-primary to-secondary"
                        : "bg-gray-200"
                    }`}
                  >
                    {status === "completed" ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : status === "current" ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut",
                        }}
                        className="w-2.5 h-2.5 bg-white rounded-full"
                      />
                    ) : (
                      <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                    )}
                  </div>

                  {/* Pulsing Ring for Current Step */}
                  {status === "current" && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full bg-primary"
                    />
                  )}
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.2 + 0.1, duration: 0.4 }}
                    className="w-1 h-16 mt-2 origin-top"
                  >
                    <div
                      className={`h-full transition-all duration-500 ${
                        status === "completed"
                          ? "bg-gradient-to-b from-primary to-secondary"
                          : "bg-gray-200 border-l-2 border-dashed border-gray-300"
                      }`}
                    />
                  </motion.div>
                )}
              </div>

              {/* Step Label */}
              <div className="pt-2">
                <p
                  className={`text-base font-semibold ${
                    status === "future" ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
