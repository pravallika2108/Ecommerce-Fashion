"use client";
import Image from "next/image";
import banner from "../../../../public/images/banner2.jpg";
import logo from "../../../../public/images/logo1.png";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { protectSignInAction } from "@/actions/auth";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      console.log("Already submitting, ignoring click");
      return;
    }
    
    setIsSubmitting(true);
    console.log("=== LOGIN FORM SUBMIT ===");
    console.log("Form data:", formData);

    const checkFirstLevelOfValidation = await protectSignInAction(
      formData.email
    );
    console.log("Validation result:", checkFirstLevelOfValidation);

    if (!checkFirstLevelOfValidation.success) {
      toast({
        title: checkFirstLevelOfValidation.error,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    console.log("Calling login function...");
    const success = await login(formData.email, formData.password);
    console.log("Login result:", success);

    if (success) {
      toast({
        title: "Login Successful!",
      });

      // Wait for state to update, then redirect
      setTimeout(() => {
        const user = useAuthStore.getState().user;
        console.log("User from store:", user);

        if (user?.role === "SUPER_ADMIN") {
          console.log("Redirecting to super-admin");
          router.push("/super-admin");
        } else {
          console.log("Redirecting to home");
          router.push("/home");
        }
        setIsSubmitting(false);
      }, 200);
    } else {
      console.log("Login failed");
      toast({
        title: "Login failed",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff6f4] flex">
      <div className="hidden lg:block w-1/2 bg-[#ffede1] relative overflow-hidden">
        <Image
          src={banner}
          alt="Register"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex justify-center">
            <Image src={logo} width={200} height={50} alt="Logo" />
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="bg-[#ffede1]"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleOnChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="bg-[#ffede1]"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleOnChange}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-black transition-colors"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? "LOGGING IN..." : "LOGIN"}
            </Button>
            <p className="text-center text-[#3f3d56] text-sm">
              New here{" "}
              <Link
                href={"/auth/register"}
                className="text-[#000] hover:underline font-bold"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
