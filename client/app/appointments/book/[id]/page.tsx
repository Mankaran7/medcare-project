"use client";

import { doctors } from "@/app/_Components/CardsGrid/ShowCards";
import Appointment from "@/app/_Components/appointment/appointmentComp";
import { notFound } from "next/navigation";
import { use } from "react";

interface Doctor {
    id: number;
    name: string;
    degree: string;
    specialty: string;
    experience: string;
    rating: number;
    image: string;
}

export default function BookAppointmentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const doctor = doctors.find(d => d.id === parseInt(id));
    
    if (!doctor) {
        notFound();
    }

    return <Appointment doctor={doctor} />;
} 