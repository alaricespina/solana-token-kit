import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreateTokenForm from "@/components/CreateTokenForm";

export default function CreateTokenPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {" "}
      {/* Added this div */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="mx-auto font-bold text-3xl">Create SPL Token</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTokenForm />
        </CardContent>
      </Card>
    </div>
  );
}
