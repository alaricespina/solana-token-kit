"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { tokenFormSchema, TokenFormValues } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Define the component
export default function CreateTokenForm() {
  const [ImageName, setImageName] = useState("");

  // Initialize the form using React Hook Form

  const form = useForm<TokenFormValues>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: "",
      decimals: 9, // Set a sensible default
      initialSupply: 1000, // Set a default
      image: undefined,
      description: "",
    },
  });

  const {
    formState: { errors },
  } = form; // Get errors from the form object

  // Function to handle form submission
  const onSubmit = (values: TokenFormValues) => {
    // In a real app, you would send this data to your backend
    console.log(values);
    alert(`Token Name: ${values.name}
Decimals: ${values.decimals}
Initial Supply: ${values.initialSupply}
Image: ${values.image}
Description: ${values.description}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex">
                <FormLabel>Token Name </FormLabel>
                <FormMessage className="ml-2" />
              </div>

              <FormControl>
                <Input placeholder="Enter token name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Decimals Field */}
        <FormField
          control={form.control}
          name="decimals"
          render={({ field }) => (
            <FormItem>
              <div className="flex">
                <FormLabel>Decimals </FormLabel>
                <FormMessage className="ml-2" />
              </div>
              <FormControl>
                <Input type="number" placeholder="e.g., 9" {...field} />
              </FormControl>
              <FormDescription>
                Number of digits after the decimal point (0-9).
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Initial Supply Field */}
        <FormField
          control={form.control}
          name="initialSupply"
          render={({ field }) => (
            <FormItem>
              <div className="flex">
                <FormLabel>Initial Supply</FormLabel>
                <FormMessage className="ml-2" />
              </div>
              <FormControl>
                <Input type="number" placeholder="e.g., 1000000" {...field} />
              </FormControl>
              <FormDescription>
                The total number of tokens to create initially.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Image Field */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <div className="flex">
                <FormLabel>Token Image </FormLabel>
                <FormMessage className="ml-2" />
              </div>
              {ImageName ? (
                <span className="text-gray-700 truncate max-w-[200px] mt-2 block">
                  {ImageName}
                </span>
              ) : (
                <span className="text-gray-500 mt-2 block">No image selected</span>
              )}
              <FormControl>
                <label
                  className={cn(
                    "cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded", // Make it look like a button
                    "focus:outline-none focus:shadow-outline w-35" // Add focus styles
                  )}
                >
                  Choose Image
                  <Input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        field.onChange(e.target.files[0]);
                        setImageName(e.target.files[0].name);
                      }
                    }}
                    className="hidden" // Keep the input hidden
                  />
                </label>
              </FormControl>
              <FormDescription>
                Upload the token's image (PNG or JPEG, max 2MB).
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter token description" {...field} />
              </FormControl>
              <FormDescription>A brief description of the token.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          {" "}
          {/* Add this div */}
          <Button type="submit" className="w-30">
            Create Token
          </Button>
        </div>
      </form>
    </Form>
  );
}
