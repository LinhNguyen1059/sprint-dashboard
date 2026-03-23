"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EyeOffIcon, Target } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import { useAppStore } from "@/stores/appStore";

export function LoginForm() {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);

  const { setStates } = useAppStore();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/verify-api-key?api_key=${apiKey}`);

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          document.cookie = `access_token=${apiKey}; path=/; max-age=31536000`;
          setStates({ authenticated: true });
        } else {
          toast.error("Invalid API key. Please try again.");
        }
      } else {
        toast.error("Failed to verify API key. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying API key:", error);
      toast.error(
        "An error occurred while verifying the API key. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="grid py-10 px-5 grid-rows-1">
        <Target className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Redmine Dashboard
        </h2>

        <div className="flex flex-col gap-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="api-key">API Key</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="api-key"
                type={showPassword ? "text" : "password"}
                placeholder="Enter API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  className="ml-auto"
                  onClick={handleTogglePassword}
                >
                  <EyeOffIcon />
                  <span className="sr-only">Show/Hide</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription
              className="text-left underline cursor-pointer"
              onClick={handleOpen}
            >
              How to get your Redmine API key?
            </FieldDescription>
          </Field>
          <Button
            type="button"
            disabled={isLoading || !apiKey}
            onClick={handleLogin}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Get Your Redmine API Key</DialogTitle>
              <DialogDescription>
                To find your Redmine API key, follow these steps:
              </DialogDescription>
            </DialogHeader>
            <div className="-mx-4 custom-scrollbar max-h-[50vh] overflow-y-auto px-4">
              <ol className="list-decimal list-inside space-y-2">
                <li>Log in to your Redmine account.</li>
                <li>
                  Click on your &quot;
                  <Link
                    href="https://bugtracker.i3international.com/my/account"
                    target="_blank"
                    className="underline"
                  >
                    My account
                  </Link>
                  &quot; in the top-right corner.
                </li>
                <li>
                  In the &quot;API access key&quot; section on the left sidebar,
                  click on the &quot;Show&quot; button.
                </li>
                <li>
                  Copy the generated API key and paste it into the input field
                  to start using the dashboard.
                </li>
              </ol>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
