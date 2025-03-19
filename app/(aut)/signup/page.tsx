"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FaGoogle, FaGithub } from "react-icons/fa"

const SignupPage = () => {
    const handleGoogleSignup = () => {
        // Add Google signup logic here
        toast.success("Signup with Google successful")
    }

    const handleGithubSignup = () => {
        // Add GitHub signup logic here
        toast.success("Signup with GitHub successful")
    }

    return (
        <div className="flex justify-center items-center h-screen">
            
            <Card>
                <CardHeader>
                    <CardTitle>Signup</CardTitle>
                </CardHeader>
                <CardContent>
                    <label>
                        Username
                        <Input />
                    </label>
                    <label>
                        Email
                        <Input />
                    </label>
                    <label>
                        Password
                        <Input type="password" />
                    </label>
                    <label>
                        Confirm Password
                        <Input type="password" />
                    </label>
                    <Button onClick={() => toast.success("Signup successful")}>Signup</Button>
                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                        <Button onClick={handleGoogleSignup} style={{ display: "flex", alignItems: "center" }}>
                            <FaGoogle style={{ marginRight: "8px" }} /> Signup with Google
                        </Button>
                        <Button onClick={handleGithubSignup} style={{ display: "flex", alignItems: "center" }}>
                            <FaGithub style={{ marginRight: "8px" }} /> Signup with GitHub
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SignupPage
