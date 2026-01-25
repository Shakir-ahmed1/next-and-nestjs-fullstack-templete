"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SignUp() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const router = useRouter();
	const [loading, setLoading] = useState(false);


	const handleEmailSignUp = async () => {
		if (password && password !== passwordConfirmation) {
			toast.error("password and confirm password must be the same")
			return;
		}
		await authClient.signUp.email({
			email,
			password,
			name: `${firstName} ${lastName}`,
			image: image ? await convertImageToBase64(image) : "",
			callbackURL: "/",
			fetchOptions: {
				onResponse: () => {
					setLoading(false);
				},
				onRequest: () => {
					setLoading(true);
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
				onSuccess: async () => {
					router.push("/");
				},
			},
		});
	}

	const handleSocialSignIn = async () => {
		await authClient.signIn.social(
			{
				provider: "google",
				callbackURL: "/"
			},
			{
				onRequest: (ctx) => {
					setLoading(true);
				},
				onResponse: (ctx) => {
					setLoading(false);
				},
				onSuccess: (ctx) => {
					toast.success("You have been signed in");
				},
				onError: (ctx) => {
					toast.error("Something went wrong");
				},
			},
		);
	}
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='flex flex-col items-center mt-4'>
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
					<CardDescription className="text-xs md:text-sm">
						Enter your information to create an account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="first-name">First name</Label>
								<Input
									id="first-name"
									placeholder="Enter your first name"
									required
									onChange={(e) => {
										setFirstName(e.target.value);
									}}
									value={firstName}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="last-name">Last name</Label>
								<Input
									id="last-name"
									placeholder="Enter your last name"
									required
									onChange={(e) => {
										setLastName(e.target.value);
									}}
									value={lastName}
								/>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								required
								onChange={(e) => {
									setEmail(e.target.value);
								}}
								value={email}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="new-password"
								placeholder="Enter your password"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password_confirmation">Confirm Password</Label>
							<Input
								id="password_confirmation"
								type="password"
								value={passwordConfirmation}
								onChange={(e) => setPasswordConfirmation(e.target.value)}
								autoComplete="new-password"
								placeholder="Confirm your password"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="image">Profile Image (optional)</Label>
							<div className="flex items-end gap-4">
								{imagePreview && (
									<div className="relative w-16 h-16 rounded-sm overflow-hidden">
										<Image
											src={imagePreview}
											alt="Profile preview"
											layout="fill"
											objectFit="cover"
										/>
									</div>
								)}
								<div className="flex items-center gap-2 w-full">
									<Input
										id="image"
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										className="w-full"
									/>
									{imagePreview && (
										<X
											className="cursor-pointer"
											onClick={() => {
												setImage(null);
												setImagePreview(null);
											}}
										/>
									)}
								</div>
							</div>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={loading}
							onClick={handleEmailSignUp}
						>
							{loading ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								"Create an account"
							)}
						</Button>

						<div className="flex items-center w-full">
							<div className="flex-1 border-t"></div>
							<span className="px-3 text-sm text-gray-500">or</span>
							<div className="flex-1 border-t"></div>
						</div>
						<div className={cn(
							"w-full gap-2 flex items-center",
							"justify-between flex-col"
						)}>

							<Button
								variant="outline"
								className={cn(
									"w-full gap-2"
								)}
								disabled={loading}
								onClick={handleSocialSignIn}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262">
									<path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
									<path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
									<path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
									<path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
								</svg>
								Continue with Google
							</Button>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<div className="flex justify-center w-full border-t py-4">
						<p className="text-center text-xs">
							Already have an account? {" "}
							<Link
								href="/signin"
							>
								<span className="dark:text-white/70 cursor-pointer text-orange-400">
									Sign in
								</span>
							</Link>
						</p>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}

async function convertImageToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}