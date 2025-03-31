"use client";

import DoctorPage from "@/app/_Components/Doctorpage/Doctorpage";
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

// Interface that DoctorPage expects
interface Doctor {
    id: number;
    name: string;
    degree: string;
    specialty: string;
    experience: string;
    rating: number;
    image: string;
    hospital: string;  // Required field
    consultationFee: number;  // Required field
}

export default function DynamicDoctorPage() {
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
                
                // Map database fields to what DoctorPage expects
                const mappedDoctor: Doctor = {
                    id: data.doctor_id,
                    name: data.doctor_name,
                    degree: data.degree,
                    specialty: data.speciality,
                    experience: `${data.experience_years} Years`,
                    rating: data.rating || 4,
                    image: data.doctor_photo,
                    hospital: `MediCare ${data.speciality} Center, ${data.location}`,  // Always set hospital
                    consultationFee: 2800  // Always set consultation fee
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

    return <DoctorPage doctor={doctor} />;
}