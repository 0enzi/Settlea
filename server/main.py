from fastapi import FastAPI
from fastapi.routing import APIRoute
# from starlette.middleware.cors import CORSMiddleware

from api.main import api_router


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


app = FastAPI(
    title="Settlea",
    description="Settlers of Catan Open Source Free alternative",
    version="0.1.0",

)

# Set all CORS enabled origins
# if settings.BACKEND_CORS_ORIGINS:
#     app.add_middleware(
#         CORSMiddleware,
#         allow_origins=[
#             str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS
#         ],
#         allow_credentials=True,
#         allow_methods=["*"],
#         allow_headers=["*"],
#     )

app.include_router(api_router)