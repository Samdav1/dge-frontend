export type DriverRank = 'starter' | 'experienced' | 'expert' | 'legend';
export type DriverStatus = 'active' | 'pending' | 'suspended' | 'banned';
export type RideStatus = 'started' | 'completed' | 'failed' | 'cancelled';
export type LocationType = 'current' | 'permanent' | 'office' | 'home';

export interface Driver {
    id: string;
    user_id: string;
    car_name: string;
    car_model: string;
    plate_number: string;
    successful_rides: number;
    total_rides: number;
    failed_rides: number;
    rank: DriverRank;
    status: DriverStatus;
}

export interface DriverCreate {
    car_name: string;
    car_model: string;
    plate_number: string;
}

export interface DriverUpdate {
    car_name?: string;
    car_model?: string;
    plate_number?: string;
}

export interface Ride {
    id: string;
    driver_id: string;
    start_location: string;
    destination: string;
    status: RideStatus;
    start_time: string;
    end_time?: string;
    earnings: number;
}

export interface RideCreate {
    start_location: string;
    destination: string;
}

export interface RideComplete {
    success: boolean;
    earnings?: number;
}

export interface LocationUpdate {
    location_type: LocationType;
    lat: number;
    lon: number;
    accuracy_meter: number;
}

export interface DriverNearbyResponse {
    driver_id: string;
    latitude: number;
    longitude: number;
    distance_km: number;
    car_name: string;
    driver_name: string;
    rating: number;
    driver_avatar?: string;
}

export type TripStatus = 'pending' | 'en_route' | 'arrived' | 'awaiting_confirmation' | 'in_progress' | 'active' | 'completed' | 'cancelled' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
    id: string;
    rider_id: string;
    driver_id?: string | null;
    driver_user_id?: string | null;
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
    pickup_address?: string | null;
    dropoff_address?: string | null;
    distance_km: number;
    estimated_fare: number;
    final_fare?: number | null;
    negotiated_fare?: number | null;
    surge_multiplier: number;
    status: TripStatus;
    requested_at: string;
    accepted_at?: string | null;
    completed_at?: string | null;
    driver_name?: string | null;
    driver_avatar?: string | null;
    rider_name?: string | null;
    rider_avatar?: string | null;
}
