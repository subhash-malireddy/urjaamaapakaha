"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckIcon, PencilIcon, Loader2, XIcon } from "lucide-react";
import {
  cn,
  getCurrentDatePlusOneMin,
  getDateTimeLocalValue,
  isDateInFuture,
  isWithinEightHoursFromDate,
  parseDateTimeLocalInput,
  areDatesEqualToMinute,
} from "@/lib/utils";
import { useActionState } from "react";
import { updateEstimatedTimeAction } from "@/lib/actions/usage-actions";

interface InlineTimeEditProps {
  deviceId: string;
  estimatedUseUntil: Date | null;
}

export function InlineTimeEdit({
  deviceId,
  estimatedUseUntil,
}: InlineTimeEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputDateTimeValue, setInputDateTimeValue] = useState<string>("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const initialInputValueRef = useRef<string>("");

  const initialState = {
    message: "",
    error: undefined,
    updatedTime: undefined,
  };

  // Use useActionState instead of useFormState + useFormStatus
  const [serverState, formAction, isPending] = useActionState(
    updateEstimatedTimeAction,
    initialState,
  );

  // Derive displayTime from either server response or prop
  const displayTime = useMemo(() => {
    if (serverState.updatedTime && !serverState.error) {
      return new Date(serverState.updatedTime);
    }
    return estimatedUseUntil;
  }, [serverState.updatedTime, serverState.error, estimatedUseUntil]);

  // Update editing state when server action completes successfully
  useEffect(() => {
    if (serverState.updatedTime && !serverState.error) {
      setIsEditing(false);
    }
  }, [serverState]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    }

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditing]);

  const formatTime = (date: Date | null): string => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const initialValue = getDateTimeLocalValue(displayTime);
    setInputDateTimeValue(initialValue);
    initialInputValueRef.current = initialValue;
    // Reset interaction state not to show error from previous interaction
    // Fresh interaction should show fresh error message if needed
    setHasInteracted(false);
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputDateTimeValue(newValue);

    // Mark as dirty as soon as the user interacts with the input
    setHasInteracted(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  // Client side validation
  const validateTime = (): string | null => {
    if (!inputDateTimeValue) {
      return "Time is required";
    }

    // Parse the input value using our consistent utility
    const selectedDate = parseDateTimeLocalInput(inputDateTimeValue);

    if (isNaN(selectedDate.getTime())) {
      return "Invalid date format";
    }

    if (!isDateInFuture(selectedDate)) {
      return "Time must be in the future";
    }

    // Only check for unchanged time if the form is dirty but reverted to initial value
    if (hasInteracted && inputDateTimeValue === initialInputValueRef.current) {
      return "No change made to the time";
    }

    // Validate if date is within 8 hours of the original estimated time
    if (
      !isWithinEightHoursFromDate(selectedDate, estimatedUseUntil ?? new Date())
    ) {
      return "A cannot be blocked for more than 8 hours from the original estimated time";
    }

    return null; // No error
  };

  // Separate function to check if input is unchanged for button disable logic
  const isInputUnchanged = (): boolean => {
    //istanbul ignore next
    if (!displayTime) return false;

    // Use parseDateTimeLocal to ensure consistent date handling
    const selectedDateTime = parseDateTimeLocalInput(inputDateTimeValue);

    // Use areDatesEqualToMinute for consistent UTC comparison
    return areDatesEqualToMinute(selectedDateTime, displayTime);
  };

  if (!isEditing)
    return (
      <div className="relative flex min-h-[56px] items-center gap-2">
        <span
          className="hover:text-muted-foreground w-[145px] cursor-pointer underline decoration-gray-400 decoration-dashed underline-offset-4"
          onClick={handleEditClick}
          title="Click to edit time"
        >
          {formatTime(displayTime)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleEditClick}
          title="Edit time"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </div>
    );

  const clientError = validateTime();
  const isUnchanged = isInputUnchanged();

  return (
    <form
      ref={formRef}
      action={formAction}
      className="relative flex min-h-[56px] flex-col gap-1"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-2">
        <input type="hidden" name="deviceId" value={deviceId} />
        <div className="relative">
          <Input
            ref={inputRef}
            type="datetime-local"
            name="estimatedTime"
            value={inputDateTimeValue}
            onChange={handleInputChange}
            // min={getDateTimeLocalValue(new Date())}
            min={getDateTimeLocalValue(getCurrentDatePlusOneMin())}
            max={getDateTimeLocalValue(
              new Date(
                (displayTime?.getTime() ?? Date.now()) + 8 * 60 * 60 * 1000,
              ),
            )}
            className={cn(
              "h-8 w-full pr-2",
              (serverState.error || clientError) && "border-destructive",
              "focus-visible:ring-1",
            )}
            aria-label="Set estimated use until time"
          />
        </div>
        <Button
          ref={submitButtonRef}
          variant="ghost"
          size="icon"
          type="submit"
          className="h-8 w-8 shrink-0"
          disabled={isPending || !!clientError || isUnchanged}
          title={isPending ? "Updating..." : clientError || "Confirm time"}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckIcon className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-8 w-8 shrink-0"
          onClick={handleCancel}
          title="Cancel edit"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
      {/* Fixed height error container to prevent UI jumping */}
      <div
        className={cn(
          "h-5 text-xs font-medium text-red-500 dark:text-red-400",
          !clientError && !serverState.error && "invisible",
          "pl-3", //match the padding of the input
        )}
        role={clientError || serverState.error ? "alert" : "none"}
      >
        **{clientError || serverState.message || " "}
      </div>
    </form>
  );
}
