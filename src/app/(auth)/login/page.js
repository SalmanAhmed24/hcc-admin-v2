"use client";
import Image from "next/image";
import "../style.scss";
import React, { useState, useEffect } from "react";
import useAuthStore from "@/store/store";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";
import { useToast } from "@/hooks/use-toast";
import moment from "moment";
import { useRouter } from "next/navigation";
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const storeUser = useAuthStore((state) => state.login);
  const { toast } = useToast();
  const router = useRouter();
  const handleLoginForm = (e) => {
    const objData = {
      username,
      password,
    };
    setLoading(true);
    e.preventDefault();
    axios
      .post(`${apiPath.prodPath}/api/users/login`, objData)
      .then((res) => {
        if (res.status !== 200) {
          Swal.fire({
            icon: "error",
            text: "Wrong username or password",
          });
          setLoading(false);
        } else {
          storeUser(res.data);
          setLoading(false);
          toast({
            title: "Logged In Successfull",
            description: `${moment().format("MM-DD-YYYY hh:mm a")}`,
          });
          router.push("/");
        }
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          text: "Wrong username or password",
        });
        setLoading(false);
      });
  };
  return (
    <section className="flex flex-row gap-10 bg-black overflow-hidden">
      <section className="p-20 flex flex-col gap-5 justify-center align-middle w-1/2 h-screen bg-black">
        <Image
          src={"/logo.png"}
          width={100}
          height={100}
          alt="Hillcountrycoders"
          className="mb-20"
        />
        <h1 className="font-bold text-2xl">Log In</h1>
        <p className="font-thin text-lg">
          Welcome back log in using your username and password.
        </p>
        <form
          className="flex p-5 flex-col gap-5 shadow-sm shadow-yellow-50 rounded-lg"
          onSubmit={handleLoginForm}
        >
          <input
            className="p-2 bg-transparent cus-inp"
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            required={true}
          />
          <input
            className="p-2 bg-transparent cus-inp"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required={true}
          />
          <div className="flex flex-row justify-center">
            <input
              className="bg-white text-black pt-2 pb-2 pr-4 pl-4 rounded-lg text-xl"
              type="submit"
              value={loading ? "Loading...." : "Log In"}
            />
          </div>
        </form>
      </section>
      <section className="flex flex-col gap-5 justify-center align-middle w-1/2 h-screen">
        <Image
          src={"/login-bg.jpeg"}
          width={896}
          height={1152}
          alt="Hillcountrycoders"
        />
      </section>
    </section>
  );
}

export default LoginPage;
