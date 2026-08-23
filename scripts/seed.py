from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select

from backend.app.core.database import SessionLocal
from backend.app.models.category import Category
from backend.app.models.supplier import Supplier
from backend.app.models.product import Product
from backend.app.models.sale import Sale
from backend.app.models.inventory_transaction import InventoryTransaction


def seed_database():
    db = SessionLocal()

    try:
        # -------------------------
        # Categories
        # -------------------------
        categories = [
            Category(name="Beverages"),
            Category(name="Snacks"),
            Category(name="Personal Care"),
            Category(name="Household"),
        ]

        db.add_all(categories)
        db.flush()

        # -------------------------
        # Suppliers
        # -------------------------
        suppliers = [
            Supplier(
                name="FreshMart Distributors",
                contact_email="sales@freshmart.example",
                phone="9876543210",
            ),
            Supplier(
                name="Prime Wholesale",
                contact_email="orders@primewholesale.example",
                phone="9876543211",
            ),
            Supplier(
                name="DailyNeeds Supply",
                contact_email="support@dailyneeds.example",
                phone="9876543212",
            ),
        ]

        db.add_all(suppliers)
        db.flush()

        # -------------------------
        # Products
        # -------------------------
        products = [
            Product(
                sku="BEV-001",
                name="Cola 500ml",
                category_id=categories[0].id,
                supplier_id=suppliers[0].id,
                price=Decimal("40.00"),
                current_stock=85,
                reorder_level=25,
            ),
            Product(
                sku="BEV-002",
                name="Orange Juice 1L",
                category_id=categories[0].id,
                supplier_id=suppliers[0].id,
                price=Decimal("110.00"),
                current_stock=42,
                reorder_level=15,
            ),
            Product(
                sku="SNK-001",
                name="Potato Chips",
                category_id=categories[1].id,
                supplier_id=suppliers[1].id,
                price=Decimal("30.00"),
                current_stock=120,
                reorder_level=30,
            ),
            Product(
                sku="SNK-002",
                name="Chocolate Bar",
                category_id=categories[1].id,
                supplier_id=suppliers[1].id,
                price=Decimal("50.00"),
                current_stock=18,
                reorder_level=20,
            ),
            Product(
                sku="PER-001",
                name="Shampoo 200ml",
                category_id=categories[2].id,
                supplier_id=suppliers[2].id,
                price=Decimal("180.00"),
                current_stock=35,
                reorder_level=10,
            ),
            Product(
                sku="HOU-001",
                name="Dishwash Liquid",
                category_id=categories[3].id,
                supplier_id=suppliers[2].id,
                price=Decimal("95.00"),
                current_stock=28,
                reorder_level=12,
            ),
        ]

        db.add_all(products)
        db.flush()

        # -------------------------
        # Sales history
        # -------------------------
        sales = []

        for days_ago in range(30, 0, -1):
            sale_date = datetime.utcnow() - timedelta(days=days_ago)

            # Different demand patterns for different products
            quantities = [
                8 + (days_ago % 5),
                3 + (days_ago % 4),
                10 + (days_ago % 7),
                5 + (days_ago % 6),
                2 + (days_ago % 3),
                4 + (days_ago % 5),
            ]

            for product, quantity in zip(products, quantities):
                sales.append(
                    Sale(
                        product_id=product.id,
                        quantity=quantity,
                        sold_at=sale_date,
                    )
                )

        db.add_all(sales)

        # -------------------------
        # Initial inventory transactions
        # -------------------------
        transactions = []

        for product in products:
            transactions.append(
                InventoryTransaction(
                    product_id=product.id,
                    transaction_type="PURCHASE",
                    quantity=product.current_stock,
                    reason="Initial inventory",
                )
            )

        db.add_all(transactions)

        db.commit()

        print("Database seeded successfully!")
        print(f"Categories: {len(categories)}")
        print(f"Suppliers: {len(suppliers)}")
        print(f"Products: {len(products)}")
        print(f"Sales: {len(sales)}")
        print(f"Inventory transactions: {len(transactions)}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()