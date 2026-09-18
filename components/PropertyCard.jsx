import Link from "next/link";
import PropertyImageCarousel from "./PropertyImageCarousel.jsx";

export default function PropertyCard({ property }) {
  return (
    <Link href={`/properties/${property._id}`} className="property-card">
      <div className="property-card-img">
        <PropertyImageCarousel images={property.images} />
      </div>
      <div className="property-card-body">
        <h3>{property.title}</h3>
        <p className="muted">{property.city}</p>
        <div className="ticket-stub">
          <span className="muted">
            {property.bedrooms} bd · {property.maxGuests} guests
          </span>
          <span className="price">
            Rs. {property.pricePerNight.toLocaleString()}
            <span className="unit"> /night</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
