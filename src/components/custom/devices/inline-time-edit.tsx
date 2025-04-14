"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckIcon, PencilIcon, Loader2, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActionState } from "react";
import { updateEstimatedTime } from "@/lib/actions/device-actions";

interface InlineTimeEditProps {
  deviceId: string;
  estimatedUseUntil: Date | null;
}

export function InlineTimeEdit({
  deviceId,
  estimatedUseUntil,
}: InlineTimeEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayTime, setDisplayTime] = useState<Date | null>(
    estimatedUseUntil,
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
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
    updateEstimatedTime,
    initialState,
  );

  // Update local state when server action completes successfully
  useEffect(() => {
    if (serverState.updatedTime && !serverState.error) {
      setDisplayTime(new Date(serverState.updatedTime));
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
    e.stopPropagation();
    const initialValue = displayTime
      ? new Date(
          displayTime.getTime() - displayTime.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16)
      : "";
    setInputValue(initialValue);
    initialInputValueRef.current = initialValue;
    setIsDirty(false);
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Mark as dirty as soon as the user interacts with the input
    setIsDirty(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
    } else if (e.key === "Enter" && !e.shiftKey) {
      const target = e.target;

      // If Enter was pressed on the input or submit button, handle validation and submission
      if (inputRef.current === target || submitButtonRef.current === target) {
        e.preventDefault(); // Only prevent default for input/submit button

        const clientError = validateTime();
        const isUnchanged = isInputUnchanged();

        if (!clientError && !isUnchanged && !isPending) {
          formRef.current?.requestSubmit();
        }
      }
      // Let browser handle Enter on other elements (like cancel button)
    }
  };

  // Client side validation
  const validateTime = (): string | null => {
    if (!inputValue) {
      return "Time is required";
    }

    const selectedDate = new Date(inputValue);
    const now = new Date();

    if (isNaN(selectedDate.getTime())) {
      return "Invalid date format";
    }

    if (selectedDate <= now) {
      return "Time must be in the future";
    }

    // Only check for unchanged time if the form is dirty but reverted to initial value
    if (isDirty && inputValue === initialInputValueRef.current) {
      return "No change made to the time";
    }

    return null; // No error
  };

  // Separate function to check if input is unchanged for button disable logic
  const isInputUnchanged = (): boolean => {
    if (!displayTime) return false;

    // Convert datetime-local string to Date for comparison
    const selectedDateTime = new Date(inputValue);
    selectedDateTime.setSeconds(0, 0);

    // Create a normalized version of displayTime for comparison
    const normalizedDisplayTime = new Date(displayTime);
    normalizedDisplayTime.setSeconds(0, 0);

    return selectedDateTime.getTime() === normalizedDisplayTime.getTime();
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
            value={inputValue}
            onChange={handleInputChange}
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)}
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
          title={clientError || "Confirm time"}
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
