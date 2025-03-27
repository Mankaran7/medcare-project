"use client";

import Appointment from "@/app/_Components/appointment/appointmentComp";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Database doctor interface
interface DatabaseDoctor {
    doctor_id: number;
    doctor_name: string;
    doctor_photo: string;
    degree: string;
    speciality: string;
    experience_years: number;
    location: string;
    rating?: number;
}

// Interface that Appointment component expects
interface Doctor {
    id: number;
    name: string;
    degree: string;
    specialty: string;
    experience: string;
    rating: number;
    image: string;
    designation?: string;
    hospital?: string;
    about?: string;
    education?: string[];
    nextAvailable?: string;
}

export default function DynamicBookingPage() {
    const params = useParams();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/admin/doctors/public/${params.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch doctor');
                }
                const data: DatabaseDoctor = await response.json();
                
                // Map database fields to what Appointment component expects
                const mappedDoctor: Doctor = {
                    id: data.doctor_id,
                    name: data.doctor_name,
                    degree: data.degree,
                    specialty: data.speciality,
                    experience: `${data.experience_years} Years`,
                    rating: data.rating || 4,
                    image: data.doctor_photo,
                    hospital: `MediCare ${data.speciality} Center, ${data.location}`,
                    designation: `${data.speciality} Specialist`,
                    nextAvailable: "Today"
                };
                
                setDoctor(mappedDoctor);
            } catch (err) {
                setError("Failed to load doctor information");
                console.error(err);
            }
        };

        if (params.id) {
            fetchDoctor();
        }
    }, [params.id]);

    if (error) return <div className="error">{error}</div>;
    if (!doctor) return <div>Loading...</div>;

    return <Appointment doctor={doctor} />;
}