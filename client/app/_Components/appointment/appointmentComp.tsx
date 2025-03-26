"use client";

import Calendar from "../Calender/showCalender";
import style from "./booking.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "../../providers/loginProvider";

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

interface AppointmentProps {
    doctor: Doctor;
}

interface TimeSlot {
    time: string;
    isAvailable: boolean;
    id?: number;
}

export default function Appointment({ doctor }: AppointmentProps) {
    const router = useRouter();
    const { user } = useLogin();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [offlineMode, setOfflineMode] = useState(true);
    const [HospitalList] = useState([
        "MediCareHeart Institute, Okhla Road",
    ]);
    
    // Define all possible time slots
    const defaultMorningSlots: TimeSlot[] = [
        { time: "9:00 AM", isAvailable: true },
        { time: "9:30 AM", isAvailable: true },
        { time: "10:00 AM", isAvailable: true },
        { time: "10:30 AM", isAvailable: true },
        { time: "11:00 AM", isAvailable: true },
        { time: "11:30 AM", isAvailable: true },
        { time: "12:00 PM", isAvailable: true }
    ];

    const defaultEveningSlots: TimeSlot[] = [
        { time: "4:00 PM", isAvailable: true },
        { time: "4:30 PM", isAvailable: true },
        { time: "5:00 PM", isAvailable: true },
        { time: "5:30 PM", isAvailable: true },
        { time: "6:00 PM", isAvailable: true },
        { time: "6:30 PM", isAvailable: true },
        { time: "7:00 PM", isAvailable: true },
        { time: "7:30 PM", isAvailable: true }
    ];

    const [morningSlots, setMorningSlots] = useState<TimeSlot[]>(defaultMorningSlots);
    const [eveningSlots, setEveningSlots] = useState<TimeSlot[]>(defaultEveningSlots);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAvailableSlots();
    }, [selectedDate, doctor.id]);

    const fetchAvailableSlots = async () => {
        try {
            setLoading(true);
            setError("");
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const response = await fetch(
                `http://localhost:3001/api/appointments/available-slots/${doctor.id}/${formattedDate}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch slots');
            }

            const dbSlots = await response.json();
            
            // Update morning slots availability
            const updatedMorningSlots = defaultMorningSlots.map(slot => {
                const dbSlot = dbSlots.find((s: any) => formatTime(s.time_slot) === slot.time);
                return {
                    ...slot,
                    id: dbSlot?.id,
                    isAvailable: dbSlot ? dbSlot.is_available : false
                };
            });

            // Update evening slots availability
            const updatedEveningSlots = defaultEveningSlots.map(slot => {
                const dbSlot = dbSlots.find((s: any) => formatTime(s.time_slot) === slot.time);
                return {
                    ...slot,
                    id: dbSlot?.id,
                    isAvailable: dbSlot ? dbSlot.is_available : false
                };
            });

            setMorningSlots(updatedMorningSlots);
            setEveningSlots(updatedEveningSlots);
        } catch (err) {
            setError("Failed to load available slots");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
    };

    const handleToggle = (isOffline: boolean) => {
        setOfflineMode(isOffline);
    };

    const handleSlotSelection = (slotId: number | undefined) => {
        if (slotId) {
            setSelectedSlot(slotId);
        }
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes.padEnd(2, '0')} ${ampm}`;
    };

    const handleNext = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (!selectedSlot) {
            setError("Please select a time slot");
            return;
        }

        try {
            setLoading(true);
            setError("");
            
            const response = await fetch('http://localhost:3001/api/appointments/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    doctorId: doctor.id,
                    slotId: selectedSlot,
                    mode: offlineMode ? 'offline' : 'online',
                    patientName: user.user_name
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to book appointment');
            }

            const appointment = await response.json();
            
            // Format the date and time for the success page
            const allSlots = [...morningSlots, ...eveningSlots];
            const selectedSlotData = allSlots.find(slot => slot.id === selectedSlot);
            const formattedDate = selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Redirect to success page with appointment details
            const searchParams = new URLSearchParams({
                doctorName: doctor.name,
                date: formattedDate,
                time: selectedSlotData ? selectedSlotData.time : '',
                mode: offlineMode ? 'Hospital Visit' : 'Video Consultation'
            });

            router.push(`/appointments/success?${searchParams.toString()}`);
        } catch (err: any) {
            setError(err.message || "Failed to book appointment");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const availableMorningCount = morningSlots.filter(slot => slot.isAvailable).length;
    const availableEveningCount = eveningSlots.filter(slot => slot.isAvailable).length;

    return (
        <main className={style.main}>
            <div className={style.info}>
                <h1>Book your next doctor's visit in Seconds</h1>
                <p>
                    Medcare helps you find the best healthcare provider by
                    specialty, location, and more, ensuring you get the care you
                    need.
                </p>
            </div>
            <div className={style.slotsBackground}>
                <div className={style.slots}>
                    <div className={style.schedule}>
                        <p>Schedule Appointment</p>
                        <button>Book Appointment</button>
                    </div>
                    <div className={style.consult}>
                        <button
                            className={!offlineMode ? style.bgGreen : style.White}
                            onClick={() => handleToggle(false)}
                        >
                            Book Video Consult
                        </button>
                        <button
                            className={offlineMode ? style.bgGreen : style.White}
                            onClick={() => handleToggle(true)}
                        >
                            Book Hospital Visit
                        </button>
                    </div>
                    <select className={style.hospitalList}>
                        {HospitalList.map((hospital, index) => (
                            <option key={index}>{hospital}</option>
                        ))}
                    </select>
                    <Calendar onDateChange={handleDateChange} />
                    
                    {error && <div className={style.error}>{error}</div>}
                    {loading ? (
                        <div className={style.loading}>Loading slots...</div>
                    ) : (
                        <>
                            <div className={style.availableSlots}>
                                <div className={style.sunCountOfSlots}>
                                    <div className={style.sunMorning}>
                                        <div className={style.sun}></div>
                                        <div className={style.morning}>Morning</div>
                                    </div>
                                    <div className={style.countOfSlots}>
                                        <span>Slots {availableMorningCount}</span>
                                    </div>
                                </div>
                                <div className={style.horizontalLine}></div>
                                <div className={style.availableSlotsContainer}>
                                    {morningSlots.map((slot, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSlotSelection(slot.id)}
                                            className={`${slot.id === selectedSlot ? style.bgGreen : style.bgWhite} ${
                                                !slot.isAvailable ? style.disabled : ''
                                            }`}
                                            disabled={!slot.isAvailable}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={style.availableSlots}>
                                <div className={style.sunCountOfSlots}>
                                    <div className={style.sunMorning}>
                                        <div className={style.sunset}></div>
                                        <div className={style.morning}>Evening</div>
                                    </div>
                                    <div className={style.countOfSlots}>
                                        <span>Slots {availableEveningCount}</span>
                                    </div>
                                </div>
                                <div className={style.horizontalLine}></div>
                                <div className={style.availableSlotsContainer}>
                                    {eveningSlots.map((slot, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSlotSelection(slot.id)}
                                            className={`${slot.id === selectedSlot ? style.bgGreen : style.bgWhite} ${
                                                !slot.isAvailable ? style.disabled : ''
                                            }`}
                                            disabled={!slot.isAvailable}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    
                    <button
                        className={style.nextButton}
                        onClick={handleNext}
                        disabled={loading || !selectedSlot}
                    >
                        {loading ? 'Booking...' : 'Next'}
                    </button>
                </div>
            </div>
        </main>
    );
}