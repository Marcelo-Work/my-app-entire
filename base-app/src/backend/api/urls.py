from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    search_products,
    user_avatar_view, 
    ContactSupportView,
    LoginView,
    SignupView,
    LogoutView,
    UserProfileView,
    ProductViewSet,
    CartView,
    OrderViewSet,
    ReviewViewSet,
    VendorProductViewSet,
    EmailLogViewSet,
    GuestCheckoutView,
    GuestOrderLookupView,
    product_recommendations,
    product_detail_with_reviews,
    validate_coupon_view,
    health_check,
    
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'vendor/products', VendorProductViewSet, basename='vendor-product')
router.register(r'email-logs', EmailLogViewSet, basename='email-log')
urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('products/search/', search_products, name='search-products'),
    path('user/avatar/', user_avatar_view, name='user-avatar'),
    path('contact/', ContactSupportView.as_view(), name='contact-support'),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/validate-coupon/', validate_coupon_view, name='validate-coupon'),
    path('products/<int:pk>/', product_detail_with_reviews, name='product-detail'),
    path('guest/checkout/', GuestCheckoutView.as_view(), name='guest-checkout'),
    path('guest/order/<uuid:token>/', GuestOrderLookupView.as_view(), name='guest-lookup'),
    path('products/<int:pk>/recommendations/', product_recommendations, name='product-recommendations'),
    path('', include(router.urls)),
]