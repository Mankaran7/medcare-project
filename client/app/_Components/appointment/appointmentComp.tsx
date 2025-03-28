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

interface ServerSlot {
    id: number;
    doctor_id: number;
    date: string;
    time_slot: string;
    is_available: boolean;
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
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [serverSlots, setServerSlots] = useState<ServerSlot[]>([]);

    useEffect(() => {
        let isMounted = true;
        let controller = new AbortController();
        
        const fetchAvailableSlots = async () => {
            try {
                if (!isMounted) return;
                
                // Don't set loading true immediately to prevent quick flashes
                const loadingTimeout = setTimeout(() => {
                    if (isMounted) setLoading(true);
                }, 300); // Only show loading if fetch takes more than 300ms

                setError("");
                const formattedDate = selectedDate.toISOString().split('T')[0];
                const response = await fetch(
                    `/api/appointments/available-slots/${doctor.id}/${formattedDate}`,
                    { signal: controller.signal }
                );
                
                clearTimeout(loadingTimeout);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch slots');
                }

                const availableSlots: ServerSlot[] = await response.json();
                
                if (!isMounted) return;

                // Create a cache of server slots for faster lookup
                const serverSlotMap = new Map(
                    availableSlots.map(slot => {
                        const [hours, minutes] = slot.time_slot.split(':');
                        const hour = parseInt(hours);
                        const minute = minutes;
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        const time = `${hour12}:${minute} ${ampm}`;
                        return [time, slot];
                    })
                );

                // Update slots using the cache
                const updatedMorningSlots = defaultMorningSlots.map(slot => ({
                    ...slot,
                    isAvailable: serverSlotMap.has(slot.time) ? serverSlotMap.get(slot.time)!.is_available : true
                }));

                const updatedEveningSlots = defaultEveningSlots.map(slot => ({
                    ...slot,
                    isAvailable: serverSlotMap.has(slot.time) ? serverSlotMap.get(slot.time)!.is_available : true
                }));

                setMorningSlots(updatedMorningSlots);
                setEveningSlots(updatedEveningSlots);
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                
                if (isMounted) {
                    setError("Failed to load available slots");
                    console.error(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchAvailableSlots();
        
        return () => {
            isMounted = false;
            controller.abort();
            setSelectedTime(null);
        };
    }, [selectedDate, doctor.id]);

    const handleDateChange = (date: Date) => {
        // Only update if the date is actually different
        if (date.getTime() !== selectedDate.getTime()) {
            setSelectedDate(date);
            setSelectedTime(null);
            setSelectedSlot(null);
        }
    };

    const handleToggle = (isOffline: boolean) => {
        setOfflineMode(isOffline);
    };

    const handleSlotSelection = (slot: TimeSlot) => {
        if (!user) {
            router.push('/login');
            return;
        }
        setSelectedTime(slot.time);
        setSelectedSlot(null);
    };

    const handleNext = async () => {
        if (!user) {
            // Save the current appointment details to localStorage
            const appointmentIntent = {
                doctorId: doctor.id,
                doctorName: doctor.name,
                date: selectedDate.toISOString(),
                time: selectedTime,
                mode: offlineMode ? 'offline' : 'online'
            };
            localStorage.setItem('appointmentIntent', JSON.stringify(appointmentIntent));
            
            // Redirect to login with return URL
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?returnUrl=${returnUrl}`);
            return;
        }

        if (!selectedTime) {
            setError("Please select a time slot");
            return;
        }

        try {
            setLoading(true);
            setError("");
            
            // Convert selected time to 24-hour format for the server
            const [time, period] = selectedTime.split(' ');
            const [hours, minutes] = time.split(':');
            let hour = parseInt(hours);
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            const timeSlot = `${hour.toString().padStart(2, '0')}:${minutes}`;
            
            const formattedDate = selectedDate.toISOString().split('T')[0];

            const response = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    doctorId: doctor.id,
                    timeSlot: timeSlot,
                    date: formattedDate,
                    mode: offlineMode ? 'offline' : 'online',
                    patientName: user.user_name
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // If not authorized, redirect to login
                    router.push('/login');
                    return;
                }
                const data = await response.json();
                throw new Error(data.message || 'Failed to book appointment');
            }

            const appointment = await response.json();
            
            // Format the date for the success page
            const formattedDateForSuccess = selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Clear any saved appointment intent
            localStorage.removeItem('appointmentIntent');
            
            // Redirect to success page with appointment details and pending status
            const searchParams = new URLSearchParams({
                doctorName: doctor.name,
                date: formattedDateForSuccess,
                time: selectedTime,
                mode: offlineMode ? 'Hospital Visit' : 'Video Consultation',
                status: 'pending'
            });

            router.push(`/appointments/success?${searchParams.toString()}`);
        } catch (err: any) {
            setError(err.message || "Failed to book appointment");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Effect to handle saved appointment intent after login
    useEffect(() => {
        if (user) {
            const savedIntent = localStorage.getItem('appointmentIntent');
            if (savedIntent) {
                try {
                    const intent = JSON.parse(savedIntent);
                    if (intent.doctorId === doctor.id) {
                        setSelectedDate(new Date(intent.date));
                        setSelectedTime(intent.time);
                        setOfflineMode(intent.mode === 'offline');
                    }
                } catch (err) {
                    console.error('Error parsing saved appointment intent:', err);
                }
            }
        }
    }, [user, doctor.id]);

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
                                            onClick={() => handleSlotSelection(slot)}
                                            className={`${style.slotButton} ${
                                                selectedTime === slot.time ? style.bgGreen : ''
                                            } ${!slot.isAvailable ? style.disabled : ''}`}
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
                                            onClick={() => handleSlotSelection(slot)}
                                            className={`${style.slotButton} ${
                                                selectedTime === slot.time ? style.bgGreen : ''
                                            } ${!slot.isAvailable ? style.disabled : ''}`}
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
                        disabled={loading || !selectedTime}
                    >
                        {loading ? 'Booking...' : 'Next'}
                    </button>
                </div>
            </div>
        </main>
    );
}