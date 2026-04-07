DigiMart - Digital Goods Marketplace

1. Public Credentials
- Customer: customer@public.com / PublicPass123!
- Vendor: vendor@public.com / PublicPass123!
- Admin: admin@public.com / PublicPass123!

2. Quick Start
-bash
cd base-app
docker compose up

### Local Testing (Alternative)
If Docker is unavailable locally:
```bash
# Backend
cd base-app/src/backend
$env:DJANGO_SETTINGS_MODULE="config.settings"
python manage.py makemigrations api
python manage.py migrate
python scripts\seed_public.py
python manage.py runserver 0.0.0.0:3000

# Frontend (new terminal)


cd base-app/src/frontend
npm install
npm run dev

# Access: http://localhost:5173
###########  How to test ###############
#Before test you must install exact Playwright version(1.58.2)
#npm install --save-dev @playwright/test@1.58.2
npx playwright install chromium
npx playwright --version
# Should output: Version 1.58.2
#Task Test
python base-app/src/backend/scripts/seed_public.py #Before test you have to run this command
npx playwright test tasks/test-cases/base-tests/public/base-public.spec.ts --reporter=list
npx playwright test tasks/test-cases/task-1/public/task-1.spec.ts --reporter=list  #public
#Run createTestImage
npx playwright test tasks/test-cases/task-2/public/task-2.spec.ts --reporter=list  #public
npx playwright test tasks/test-cases/task-3/public/task-3.spec.ts --reporter=list  #public
npx playwright test tasks/test-cases/task-4/public/task-4.spec.ts --reporter=list  #public
npx playwright test tasks/test-cases/task-5/public/task-5.spec.ts --reporter=list  #public
npx playwright test tasks/test-cases/task-6/public/task-6.spec.ts --reporter=list  #public
npx playwright test tasks/test-cases/task-7/public/task-7.spec.ts --reporter=list  #public
npx playwright test tasks/test-cases/task-8/public/task-8.spec.ts --reporter=list  #public
npx playwright test tasks/test-cases/task-9/public/task-9.spec.ts --reporter=list  #public
npx playwright test tasks/test-cases/task-10/public/task-10.spec.ts --reporter=list  #public
#Evaluation Test
python evaluation/scripts/seed_private.py #Before test you have to run this command in project root
npx playwright test evaluation/private-test-cases/base-tests/private/base-private.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-1/private/task-1.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-2/private/task-2.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-3/private/task-3.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-4/private/task-4.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-5/private/task-5.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-6/private/task-6.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-7/private/task-7.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-8/private/task-8.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-9/private/task-9.spec.ts --reporter=list # Private
npx playwright test evaluation/private-test-cases/task-10/private/task-10.spec.ts --reporter=list # Private



