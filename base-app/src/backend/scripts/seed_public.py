import os
import sys
from decimal import Decimal
from datetime import timedelta

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    import django
    django.setup()
    print("✅ Django setup successful!")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Django setup failed! {e}")
    sys.exit(1)

try:
    from api.models import User, Profile, Product, Order, OrderItem, Review, Coupon
    from django.utils import timezone
    print("✅ Models imported successfully!")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not import models! {e}")
    sys.exit(1)

def seed_data():
    print("\n🌱 === STARTING TASK 10 SEED (Recommendations) ===")
    
    # -------------------------------------------------------------------------
    # 1. CREATE USERS (With specific purchase behaviors)
    # -------------------------------------------------------------------------
    users_data = [
        {"username": "admin_public", "email": "admin@public.com", "pwd": "AdminPass123!", "role": "admin"},
        {"username": "vendor_public", "email": "vendor@public.com", "pwd": "VendorPass123!", "role": "vendor"},
        {"username": "customer_public", "email": "customer@public.com", "pwd": "PublicPass123!", "role": "customer"},
        # New user who buys ONLY Furniture (for personalization test)
        {"username": "furniture_fan", "email": "furniture@public.com", "pwd": "Pass123!", "role": "customer"},
        # New user who buys ONLY Electronics (for personalization test)
        {"username": "tech_lover", "email": "tech@public.com", "pwd": "Pass123!", "role": "customer"},
    ]

    created_users = {}
    for u_data in users_data:
        user, _ = User.objects.get_or_create(username=u_data["username"])
        user.set_password(u_data["pwd"])
        user.email = u_data["email"]
        user.is_staff = (u_data["role"] == 'admin')
        user.save()
        
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = u_data["role"]
        profile.save()
        created_users[u_data["username"]] = user
        print(f"   ✅ User: {u_data['username']} ({u_data['role']})")

    # -------------------------------------------------------------------------
    # 2. CREATE PRODUCTS (With CATEGORIES)
    # -------------------------------------------------------------------------
    print("\n   📦 Creating Products with Categories...")
    vendor = created_users["vendor_public"]

    products_data = [
        # Electronics Category
        {"title": "Premium Wireless Headphones", "cat": "Electronics", "price": "99.00"},
        {"title": "Mechanical Gaming Keyboard", "cat": "Electronics", "price": "89.50"},
        {"title": "4K Ultra HD Monitor", "cat": "Electronics", "price": "299.99"},
        {"title": "USB-C Hub Adapter", "cat": "Electronics", "price": "25.99"},
        {"title": "Private Gaming Mouse", "cat": "Electronics", "price": "49.99"},
        
        # Furniture Category
        {"title": "Ergonomic Office Chair", "cat": "Furniture", "price": "150.00"},
        {"title": "Standing Desk", "cat": "Furniture", "price": "350.00"},
        {"title": "Bookshelf", "cat": "Furniture", "price": "75.00"},
        
        # Accessories Category
        {"title": "Laptop Bag", "cat": "Accessories", "price": "45.00"},
        {"title": "Mouse Pad", "cat": "Accessories", "price": "15.00"},
    ]

    created_products = {}
    for p_data in products_data:
        obj, _ = Product.objects.get_or_create(
            title=p_data["title"],
            defaults={
                "price": p_data["price"],
                "description": f"High quality {p_data['title']} in {p_data['cat']} category.",
                "vendor": vendor,
                "category": p_data["cat"], # ✅ CRITICAL FOR TASK 10
                "file_url": f"https://via.placeholder.com/300?text={p_data['title'].replace(' ', '+')}"
            }
        )
        created_products[p_data["title"]] = obj
        print(f"      ➕ {p_data['title']} ({p_data['cat']})")

    # -------------------------------------------------------------------------
    # 3. CREATE ORDERS (For "Frequently Bought Together" Logic)
    # -------------------------------------------------------------------------
    print("\n   🛒 Creating Orders for Recommendation Logic...")

    # Scenario A: Tech Lover buys Headphones + Keyboard + Mouse Pad (Electronics bundle)
    tech_user = created_users["tech_lover"]
    order_tech = Order.objects.create(user=tech_user, total_amount=Decimal("204.49"), status="completed")
    items_tech = [
        ("Premium Wireless Headphones", 1),
        ("Mechanical Gaming Keyboard", 1),
        ("Mouse Pad", 1)
    ]
    for title, qty in items_tech:
        prod = created_products[title]
        OrderItem.objects.create(order=order_tech, product=prod, quantity=qty, total_price=prod.price * qty)
    print(f"      ✅ Tech Lover bought: Headphones + Keyboard + Mouse Pad")

    # Scenario B: Furniture Fan buys Chair + Desk (Furniture bundle)
    furn_user = created_users["furniture_fan"]
    order_furn = Order.objects.create(user=furn_user, total_amount=Decimal("500.00"), status="completed")
    items_furn = [
        ("Ergonomic Office Chair", 1),
        ("Standing Desk", 1)
    ]
    for title, qty in items_furn:
        prod = created_products[title]
        OrderItem.objects.create(order=order_furn, product=prod, quantity=qty, total_price=prod.price * qty)
    print(f"      ✅ Furniture Fan bought: Chair + Desk")

    # Scenario C: General Customer buys Headphones + Laptop Bag (Cross category but common)
    gen_user = created_users["customer_public"]
    order_gen = Order.objects.create(user=gen_user, total_amount=Decimal("144.00"), status="completed")
    items_gen = [
        ("Premium Wireless Headphones", 1),
        ("Laptop Bag", 1)
    ]
    for title, qty in items_gen:
        prod = created_products[title]
        OrderItem.objects.create(order=order_gen, product=prod, quantity=qty, total_price=prod.price * qty)
    print(f"      ✅ Customer bought: Headphones + Laptop Bag")

    # -------------------------------------------------------------------------
    # 4. CREATE REVIEWS (For "Popular Products" Fallback)
    # -------------------------------------------------------------------------
    print("\n   ⭐ Creating Reviews (for Popularity Fallback)...")
    
    # Helper to safely create reviews
    def safe_review(user, product, rating, comment):
        obj, created = Review.objects.get_or_create(
            user=user,
            product=product,
            defaults={'rating': rating, 'comment': comment}
        )
        if not created:
            # If it already existed, update it to ensure rating/comment are correct
            obj.rating = rating
            obj.comment = comment
            obj.save()
            print(f"      ⏭️  Updated existing review: {user.username} on {product.title}")
        else:
            print(f"      ➕ Created review: {user.username} on {product.title}")
        return obj

    headphones = created_products["Premium Wireless Headphones"]
    chair = created_products["Ergonomic Office Chair"]
    
    # Scenario A: Make Headphones popular with MULTIPLE different users
    # (Since one user can only review once, we use different users to boost popularity)
    users_for_reviews = [
        created_users["customer_public"],
        created_users["tech_lover"],
        created_users["furniture_fan"], # Even furniture fans might like headphones
    ]
    
    # Add admin if needed to get more reviews
    if "admin_public" in created_users:
        users_for_reviews.append(created_users["admin_public"])

    for i, user in enumerate(users_for_reviews):
        safe_review(
            user=user,
            product=headphones,
            rating=5,
            comment=f"Great headphones! Highly recommended. (Seed #{i+1})"
        )

    # Scenario B: Make Chair popular
    safe_review(
        user=created_users["furniture_fan"],
        product=chair,
        rating=4,
        comment="Very comfortable for long work sessions."
    )
    
    # Add a review from customer_public for chair too if not exists
    safe_review(
        user=created_users["customer_public"],
        product=chair,
        rating=5,
        comment="Best chair I've ever owned!"
    )

    # Update stats manually if your model doesn't have signals connected
    if hasattr(headphones, 'update_rating_stats'):
        headphones.update_rating_stats()
    if hasattr(chair, 'update_rating_stats'):
        chair.update_rating_stats()

    print("      ✅ Reviews processed successfully.")

    # -------------------------------------------------------------------------
    # 5. COUPONS (Standard Task 5 Data)
    # -------------------------------------------------------------------------
    coupons_data = [
        {"code": "WELCOME10", "percent": 10.00, "min": 0, "days": 365},
        {"code": "EXPIRED20", "percent": 20.00, "min": 0, "days": -1},
    ]
    for c in coupons_data:
        Coupon.objects.get_or_create(
            code=c["code"],
            defaults={
                "discount_percent": c["percent"],
                "min_order_amount": c["min"],
                "expires_at": timezone.now() + timedelta(days=c["days"]),
                "is_active": True
            }
        )

    # -------------------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------------------
    print(f"\n🎉 === SEED COMPLETE ===")
    print(f"   Total Products: {Product.objects.count()}")
    print(f"   Categories: Electronics, Furniture, Accessories")
    print(f"   Total Orders: {Order.objects.count()}")
    print(f"   \n   🔑 Test Scenarios Ready:")
    print(f"   1. View 'Headphones' -> Related: 'Keyboard' (Same Cat), FBT: 'Keyboard' & 'Laptop Bag'")
    print(f"   2. View 'Chair' -> Related: 'Desk' (Same Cat), FBT: 'Desk'")
    print(f"   3. Login as 'tech_lover' -> See more Electronics recommendations")
    print(f"   4. Login as 'furniture_fan' -> See more Furniture recommendations")
    print(f"\n   🔑 Logins:")
    print(f"   👤 tech_lover / Pass123!")
    print(f"   👤 furniture_fan / Pass123!")
    print(f"   👤 customer_public / PublicPass123!")
    print("========================\n")

if __name__ == "__main__":
    try:
        seed_data()
    except Exception as e:
        print(f"\n💥 UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()