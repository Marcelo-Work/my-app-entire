#!/usr/bin/env python
"""
Private Seed Script for DigiMart - Task 10 Evaluation
Location: evaluation/scripts/seed_private.py
"""
import os
import sys
from pathlib import Path
from decimal import Decimal
from datetime import timedelta

current_file = Path(__file__).resolve()
current_dir = current_file.parent  # evaluation/scripts/
project_root = current_dir.parent.parent  # project-root/
backend_dir = project_root / 'base-app' / 'src' / 'backend'

# Add backend directory to Python path
sys.path.insert(0, str(backend_dir))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    import django
    django.setup()
    print("✅ Django setup successful!")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Django setup failed! {e}")
    print(f"   Backend dir: {backend_dir}")
    print(f"   Python path: {sys.path[:3]}")
    sys.exit(1)

try:
    from django.contrib.auth import get_user_model
    from api.models import User, Profile, Product, Order, OrderItem, Review, Coupon, Cart
    from django.utils import timezone
    print("✅ Models imported successfully!")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not import models! {e}")
    sys.exit(1)


def seed_private_data():

    print("\n🌱 === STARTING PRIVATE SEED (Task 10 Evaluation) ===")
    
    print("\n   👥 Creating Private Users...")
    
    users_data = [
        {"username": "admin_private", "email": "admin@private.com", "password": "AdminPrivate123!", "role": "admin"},
        {"username": "vendor_private", "email": "vendor@private.com", "password": "VendorPrivate123!", "role": "vendor"},
        {"username": "customer_private", "email": "customer@private.com", "password": "CustomerPrivate123!", "role": "customer"},
        {"username": "furniture_fan_private", "email": "furniture@private.com", "password": "FurniturePrivate123!", "role": "customer"},
        {"username": "tech_lover_private", "email": "tech@private.com", "password": "TechPrivate123!", "role": "customer"},
    ]

    created_users = {}
    for u_data in users_data:
        existing = User.objects.filter(email=u_data["email"]).first()
        if existing:
            existing.delete()
        
        user = User.objects.create_user(
            username=u_data["username"],
            email=u_data["email"],
            password=u_data["password"]
        )
        user.is_staff = (u_data["role"] == 'admin')
        user.save()
        
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = u_data["role"]
        profile.save()
        
        created_users[u_data["username"]] = user
        print(f"   ✅ User: {u_data['username']} ({u_data['role']})")

    print("\n   📦 Creating Private Products...")
    vendor = created_users["vendor_private"]

    products_data = [
        {"title": "Private Wireless Headphones", "cat": "Electronics", "price": "109.00"},
        {"title": "Private Mechanical Keyboard", "cat": "Electronics", "price": "95.50"},
        {"title": "Private 4K Display Monitor", "cat": "Electronics", "price": "319.99"},
        {"title": "Private USB-C Dock", "cat": "Electronics", "price": "35.99"},
        {"title": "Private Gaming Mouse Pro", "cat": "Electronics", "price": "59.99"},
        
        # Furniture Category (3 products)
        {"title": "Private Ergonomic Chair", "cat": "Furniture", "price": "165.00"},
        {"title": "Private Adjustable Desk", "cat": "Furniture", "price": "385.00"},
        {"title": "Private Storage Shelf", "cat": "Furniture", "price": "85.00"},
        
        # Accessories Category (2 products)
        {"title": "Private Laptop Sleeve", "cat": "Accessories", "price": "55.00"},
        {"title": "Private Desk Mat", "cat": "Accessories", "price": "25.00"},
    ]

    created_products = {}
    for p_data in products_data:
        Product.objects.filter(title=p_data["title"]).delete()
        
        obj = Product.objects.create(
            title=p_data["title"],
            description=f"Premium private {p_data['title']} in {p_data['cat']} category.",
            price=p_data["price"],
            vendor=vendor,
            category=p_data["cat"],
            file_url=f"https://via.placeholder.com/300?text=Private+{p_data['title'].replace(' ', '+')}"
        )
        created_products[p_data["title"]] = obj
        print(f"      ➕ {p_data['title']} ({p_data['cat']})")

    print("\n   🛒 Creating Private Orders...")

    tech_user = created_users["tech_lover_private"]
    order_tech = Order.objects.create(
        user=tech_user, 
        total_amount=Decimal("270.49"), 
        status="completed"
    )
    items_tech = [
        ("Private Wireless Headphones", 1),
        ("Private Mechanical Keyboard", 1),
        ("Private Desk Mat", 1)
    ]
    for title, qty in items_tech:
        prod = created_products[title]
        OrderItem.objects.create(
            order=order_tech, 
            product=prod, 
            quantity=qty, 
            total_price=Decimal(str(prod.price)) * qty
        )
    print(f"      ✅ Tech Lover Private bought: Headphones + Keyboard + Desk Mat")

    furn_user = created_users["furniture_fan_private"]
    order_furn = Order.objects.create(
        user=furn_user, 
        total_amount=Decimal("550.00"), 
        status="completed"
    )
    items_furn = [
        ("Private Ergonomic Chair", 1),
        ("Private Adjustable Desk", 1)
    ]
    for title, qty in items_furn:
        prod = created_products[title]
        OrderItem.objects.create(
            order=order_furn, 
            product=prod, 
            quantity=qty, 
            total_price=Decimal(str(prod.price)) * qty
        )
    print(f"      ✅ Furniture Fan Private bought: Chair + Desk")

    gen_user = created_users["customer_private"]
    order_gen = Order.objects.create(
        user=gen_user, 
        total_amount=Decimal("164.00"), 
        status="completed"
    )
    items_gen = [
        ("Private Wireless Headphones", 1),
        ("Private Laptop Sleeve", 1)
    ]
    for title, qty in items_gen:
        prod = created_products[title]
        OrderItem.objects.create(
            order=order_gen, 
            product=prod, 
            quantity=qty, 
            total_price=Decimal(str(prod.price)) * qty
        )
    print(f"      ✅ Customer Private bought: Headphones + Laptop Sleeve")

    print("\n   ⭐ Creating Private Reviews...")

    def safe_review(user, product, rating, comment):
        obj, created = Review.objects.get_or_create(
            user=user,
            product=product,
            defaults={'rating': rating, 'comment': comment}
        )
        if not created:
            obj.rating = rating
            obj.comment = comment
            obj.save()
        product.update_rating_stats()
        return obj

    headphones = created_products["Private Wireless Headphones"]
    chair = created_products["Private Ergonomic Chair"]

    for i, user in enumerate([
        created_users["customer_private"],
        created_users["tech_lover_private"],
        created_users["furniture_fan_private"],
    ]):
        safe_review(
            user=user,
            product=headphones,
            rating=5,
            comment=f"Excellent private product! Highly recommended. (Seed #{i+1})"
        )

    # Add reviews for chair
    safe_review(
        user=created_users["furniture_fan_private"],
        product=chair,
        rating=4,
        comment="Very comfortable for private testing sessions."
    )
    safe_review(
        user=created_users["customer_private"],
        product=chair,
        rating=5,
        comment="Best private chair for long work hours!"
    )

    print("      ✅ Reviews processed successfully.")

    print("\n   🎫 Creating Private Coupons...")
    
    coupons_data = [
        {"code": "WELCOME10_PRIVATE", "percent": 10.00, "min": 0, "days": 365},
        {"code": "EXPIRED20_PRIVATE", "percent": 20.00, "min": 0, "days": -1},  # Expired
    ]
    
    for c in coupons_data:
        Coupon.objects.filter(code=c["code"]).delete()  # Clean existing
        Coupon.objects.create(
            code=c["code"],
            discount_percent=c["percent"],
            min_order_amount=c["min"],
            expires_at=timezone.now() + timedelta(days=c["days"]),
            is_active=True
        )
        print(f"      ➕ Coupon: {c['code']} ({c['percent']}%)")

    print("\n   🛍️ Creating Private Carts...")
    for username, user in created_users.items():
        Cart.objects.get_or_create(user=user, defaults={'items': []})
    print("      ✅ Carts ready for all private users")

    print(f"\n🎉 === PRIVATE SEED COMPLETE ===")
    print(f"   Total Users: {User.objects.count()}")
    print(f"   Total Products: {Product.objects.count()}")
    print(f"   Categories: Electronics, Furniture, Accessories")
    print(f"   Total Orders: {Order.objects.count()}")
    print(f"   Total Reviews: {Review.objects.count()}")
    print(f"   Total Coupons: {Coupon.objects.count()}")
    
    print(f"\n   🔑 Private Credentials (DO NOT SHARE PUBLICLY):")
    print(f"   👤 admin_private / AdminPrivate123! (admin@private.com)")
    print(f"   👤 vendor_private / VendorPrivate123! (vendor@private.com)")
    print(f"   👤 customer_private / CustomerPrivate123! (customer@private.com)")
    print(f"   👤 tech_lover_private / TechPrivate123! (tech@private.com)")
    print(f"   👤 furniture_fan_private / FurniturePrivate123! (furniture@private.com)")
    
    print(f"\n   🔑 Private Coupons:")
    print(f"   🎫 WELCOME10_PRIVATE (10% off, active)")
    print(f"   🎫 EXPIRED20_PRIVATE (20% off, expired)")
    
    print(f"\n   ✅ Ready for Private Evaluation Tests")
    print(f"==============================\n")


if __name__ == '__main__':
    try:
        seed_private_data()
        print("✅ Private seed script completed successfully")
        sys.exit(0)
    except Exception as e:
        print(f"\n💥 UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)